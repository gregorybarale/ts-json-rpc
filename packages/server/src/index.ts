import {
    JSONRPCRequest,
    JSONRPCNotification,
    JSONRPCResponse,
    JSONRPCSuccessResponse,
    JSONRPCErrorResponse,
    createJsonRpcErrorResponse,
    createStandardJsonRpcError,
    isJSONRPCRequest,
    isJSONRPCNotification,
    JSONRPC_ERROR_CODES,
} from '@ts-json-rpc/core';

export type JsonRpcMethodHandler<TParams = unknown, TResult = unknown, TContext = unknown> = (
    params: TParams,
    context: TContext,
) => Promise<TResult> | TResult;

export type JsonRpcMethodMap<TContext = unknown> = Record<string, JsonRpcMethodHandler<unknown, unknown, TContext>>;

export interface JsonRpcServerOptions {
    logger?: {
        info: (message: string, ...args: unknown[]) => void;
        warn: (message: string, ...args: unknown[]) => void;
        error: (message: string, ...args: unknown[]) => void;
    };
    strictMethodHandling?: boolean;
}

export interface JsonRpcServerInstance {
    handleJsonRpcRequest<TContext = unknown>(
        rawJsonPayload: unknown,
        context?: TContext
    ): Promise<unknown>;
}

export function createJsonRpcServer<TContext = unknown>(
    methods: JsonRpcMethodMap<TContext>,
    options: JsonRpcServerOptions = {}
): JsonRpcServerInstance {
    const logger = options.logger || {
        info: (...args: unknown[]) => console.log(...args),
        warn: (...args: unknown[]) => console.warn(...args),
        error: (...args: unknown[]) => console.error(...args),
    };
    const strictMethodHandling = options.strictMethodHandling ?? true;

    async function handleJsonRpcRequest<TContext = unknown>(
        rawJsonPayload: unknown,
        context?: TContext
    ): Promise<unknown> {
        // Parse JSON payload
        let parsedPayload: unknown;
        try {
            if (typeof rawJsonPayload === 'string') {
                parsedPayload = JSON.parse(rawJsonPayload);
            } else {
                parsedPayload = rawJsonPayload;
            }
        } catch (error) {
            logger.error('JSON-RPC parse error:', error);
            const parseError = createStandardJsonRpcError('PARSE_ERROR');
            return createJsonRpcErrorResponse(null, parseError);
        }

        // Validate JSON-RPC structure
        if (!isValidJsonRpcPayload(parsedPayload)) {
            logger.warn('JSON-RPC invalid request structure:', parsedPayload);
            const invalidRequestError = createStandardJsonRpcError('INVALID_REQUEST');
            return createJsonRpcErrorResponse(null, invalidRequestError);
        }

        // Handle batch requests
        if (Array.isArray(parsedPayload)) {
            if (parsedPayload.length === 0) {
                logger.warn('JSON-RPC empty batch request');
                const invalidRequestError = createStandardJsonRpcError('INVALID_REQUEST');
                return createJsonRpcErrorResponse(null, invalidRequestError);
            }

            const responses: JSONRPCResponse[] = [];
            for (const item of parsedPayload) {
                const response = await handleSingleRequest(item, context);
                if (response !== null) {
                    responses.push(response);
                }
            }

            return responses.length > 0 ? responses : null;
        }

        // Handle single request
        return handleSingleRequest(parsedPayload, context);
    }

    async function handleSingleRequest<TContext = unknown>(
        request: JSONRPCRequest | JSONRPCNotification,
        context?: TContext
    ): Promise<JSONRPCResponse | null> {
        const isRequest = isJSONRPCRequest(request);
        const isNotification = isJSONRPCNotification(request);

        if (!isRequest && !isNotification) {
            const invalidRequestError = createStandardJsonRpcError('INVALID_REQUEST');
            return createJsonRpcErrorResponse(null, invalidRequestError);
        }

        const method = request.method;
        const params = request.params;
        const id = isRequest ? request.id : null;

        // Check if method exists
        const methodHandler = methods[method];
        if (!methodHandler) {
            if (isNotification) {
                logger.info(`JSON-RPC notification for unknown method: ${method}`);
                return null;
            }

            if (strictMethodHandling) {
                logger.warn(`JSON-RPC method not found: ${method}`);
                const methodNotFoundError = createStandardJsonRpcError('METHOD_NOT_FOUND');
                return createJsonRpcErrorResponse(id, methodNotFoundError);
            }

            logger.info(`JSON-RPC method not found (non-strict mode): ${method}`);
            return null;
        }

        // Execute method handler
        try {
            const result = await methodHandler(params, context as any);
            
            // Return null for notifications (no response)
            if (isNotification) {
                return null;
            }

            // Return success response for requests
            return {
                jsonrpc: '2.0',
                id,
                result,
            } as JSONRPCSuccessResponse;
        } catch (error) {
            // Don't return error responses for notifications
            if (isNotification) {
                logger.error(`JSON-RPC notification method error in ${method}:`, error);
                return null;
            }

            // Handle errors for requests
            if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
                // Custom JSON-RPC error
                logger.warn(`JSON-RPC method error in ${method}:`, error);
                return createJsonRpcErrorResponse(id, error as any);
            } else {
                // Internal server error
                logger.error(`JSON-RPC internal error in ${method}:`, error);
                const internalError = createStandardJsonRpcError('INTERNAL_ERROR');
                return createJsonRpcErrorResponse(id, internalError);
            }
        }
    }

    function isValidJsonRpcPayload(payload: unknown): payload is JSONRPCRequest | JSONRPCNotification | (JSONRPCRequest | JSONRPCNotification)[] {
        if (Array.isArray(payload)) {
            return payload.every(item => isJSONRPCRequest(item) || isJSONRPCNotification(item));
        }
        return isJSONRPCRequest(payload) || isJSONRPCNotification(payload);
    }

    return {
        handleJsonRpcRequest,
    };
}