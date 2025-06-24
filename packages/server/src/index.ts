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

/**
 * Method handler function type for JSON-RPC server methods.
 * Handles incoming JSON-RPC requests and notifications by executing the appropriate logic.
 * 
 * @template TParams The type of the parameters passed to the method
 * @template TResult The type of the result returned by the method
 * @template TContext The type of the context object passed to all method handlers
 * @param params The parameters passed with the JSON-RPC request/notification
 * @param context Additional context data (e.g., user information, request metadata)
 * @returns The result of the method execution (can be async)
 * 
 * @example
 * ```typescript
 * const addHandler: JsonRpcMethodHandler<{ a: number; b: number }, number> = 
 *   (params, context) => {
 *     return params.a + params.b;
 *   };
 * 
 * const asyncHandler: JsonRpcMethodHandler<{ id: string }, User> = 
 *   async (params, context) => {
 *     return await getUserById(params.id);
 *   };
 * ```
 */
export type JsonRpcMethodHandler<TParams = unknown, TResult = unknown, TContext = unknown> = (
    params: TParams,
    context: TContext,
) => Promise<TResult> | TResult;

/**
 * Map of method names to their corresponding handler functions.
 * This defines all the methods that the JSON-RPC server can handle.
 * 
 * @template TContext The type of the context object passed to all method handlers
 * 
 * @example
 * ```typescript
 * const methods: JsonRpcMethodMap<{ userId?: string }> = {
 *   add: (params: { a: number; b: number }) => params.a + params.b,
 *   greet: (params: { name: string }, context) => `Hello ${params.name}! User: ${context.userId}`,
 *   log: (params: { message: string }) => console.log(params.message),
 * };
 * ```
 */
export type JsonRpcMethodMap<TContext = unknown> = Record<string, JsonRpcMethodHandler<unknown, unknown, TContext>>;

/**
 * Configuration options for the JSON-RPC server.
 * 
 * @example
 * ```typescript
 * const options: JsonRpcServerOptions = {
 *   logger: {
 *     info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
 *     warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
 *     error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
 *   },
 *   strictMethodHandling: true,
 * };
 * ```
 */
export interface JsonRpcServerOptions {
    /**
     * Optional logger for server operations.
     * If not provided, console methods will be used as defaults.
     */
    logger?: {
        /** Log informational messages */
        info: (message: string, ...args: unknown[]) => void;
        /** Log warning messages */
        warn: (message: string, ...args: unknown[]) => void;
        /** Log error messages */
        error: (message: string, ...args: unknown[]) => void;
    };
    /**
     * Whether to return "Method not found" errors for unknown methods.
     * - true (default): Returns error responses for unknown methods
     * - false: Silently ignores unknown methods (returns null)
     */
    strictMethodHandling?: boolean;
}

/**
 * JSON-RPC server instance interface.
 * Provides methods for handling incoming JSON-RPC requests and notifications.
 * 
 * @example
 * ```typescript
 * const server = createJsonRpcServer(methods);
 * 
 * // Handle HTTP request (Express example)
 * app.post('/api/jsonrpc', async (req, res) => {
 *   const response = await server.handleJsonRpcRequest(req.body, {
 *     userId: req.user?.id,
 *   });
 *   
 *   if (response !== null) {
 *     res.json(response);
 *   } else {
 *     res.status(204).send(); // No response for notifications
 *   }
 * });
 * ```
 */
export interface JsonRpcServerInstance {
    /**
     * Handles an incoming JSON-RPC request or notification.
     * Supports both single requests and batch requests.
     * 
     * @template TContext The type of the context object
     * @param rawJsonPayload The raw JSON payload (string or parsed object)
     * @param context Optional context data to pass to method handlers
     * @returns Promise that resolves to the response (null for notifications)
     * 
     * @example
     * ```typescript
     * // Single request
     * const response = await server.handleJsonRpcRequest({
     *   jsonrpc: '2.0',
     *   method: 'add',
     *   params: { a: 1, b: 2 },
     *   id: 1
     * });
     * 
     * // Batch request
     * const batchResponse = await server.handleJsonRpcRequest([
     *   { jsonrpc: '2.0', method: 'add', params: { a: 1, b: 2 }, id: 1 },
     *   { jsonrpc: '2.0', method: 'log', params: { message: 'test' } }
     * ]);
     * ```
     */
    handleJsonRpcRequest<TContext = unknown>(
        rawJsonPayload: unknown,
        context?: TContext
    ): Promise<unknown>;
}

/**
 * Creates a JSON-RPC 2.0 server with the provided method handlers and options.
 * The server handles parsing, validation, method dispatch, error handling, and response formatting.
 * 
 * @template TContext The type of the context object passed to method handlers
 * @param methods Map of method names to their handler functions
 * @param options Optional configuration for the server
 * @returns A JSON-RPC server instance
 * 
 * @example
 * ```typescript
 * const methods = {
 *   add: (params: { a: number; b: number }) => params.a + params.b,
 *   greet: (params: { name: string }, context: { userId?: string }) => 
 *     `Hello ${params.name}! User: ${context.userId || 'anonymous'}`,
 *   log: (params: { message: string }) => console.log(params.message),
 * };
 * 
 * const server = createJsonRpcServer(methods, {
 *   strictMethodHandling: true,
 *   logger: console,
 * });
 * 
 * // Use with HTTP server
 * const response = await server.handleJsonRpcRequest(requestBody, { userId: '123' });
 * ```
 */
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

    /**
     * Implementation of the main request handling logic.
     * Parses JSON, validates structure, handles both single and batch requests.
     * 
     * @template TContext The type of the context object
     * @param rawJsonPayload The raw JSON payload (string or parsed object)
     * @param context Optional context data to pass to method handlers
     * @returns Promise that resolves to the response (null for notifications)
     */
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

    /**
     * Handles a single JSON-RPC request or notification.
     * Validates the request, dispatches to the appropriate method handler,
     * and formats the response according to JSON-RPC 2.0 specification.
     * 
     * @template TContext The type of the context object
     * @param request The JSON-RPC request or notification to handle
     * @param context Optional context data to pass to method handlers
     * @returns Promise that resolves to a response (null for notifications)
     */
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

    /**
     * Type guard to validate if a payload is a valid JSON-RPC request structure.
     * Supports both single requests/notifications and batch arrays.
     * 
     * @param payload The payload to validate
     * @returns True if the payload is a valid JSON-RPC structure
     */
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