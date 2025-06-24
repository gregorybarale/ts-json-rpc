export interface JSONRPCRequest<TParams = unknown> {
    jsonrpc: '2.0';
    method: string;
    params?: TParams;
    id: string | number;
}

export interface JSONRPCNotification<TParams = unknown> {
    jsonrpc: '2.0';
    method: string;
    params?: TParams;
}

export interface JSONRPCError {
    code: number;
    message: string;
    data?: unknown;
}

export interface JSONRPCSuccessResponse<TResult = unknown> {
    jsonrpc: '2.0';
    result: TResult;
    id: string | number;
}

export interface JSONRPCErrorResponse {
    jsonrpc: '2.0';
    error: JSONRPCError;
    id: string | number | null;
}

export type JSONRPCResponse<TResult = unknown> =
    | JSONRPCSuccessResponse<TResult>
    | JSONRPCErrorResponse;

export type JSONRPCRequestBatch<TParams = unknown> = JSONRPCRequest<TParams>[];
export type JSONRPCNotificationBatch<TParams = unknown> = JSONRPCNotification<TParams>[];
export type JSONRPCResponseBatch<TResult = unknown> = JSONRPCResponse<TResult>[];

export type JSONRPCMessage<TParams = unknown, TResult = unknown> =
    | JSONRPCRequest<TParams>
    | JSONRPCNotification<TParams>
    | JSONRPCResponse<TResult>
    | JSONRPCRequestBatch<TParams>
    | JSONRPCNotificationBatch<TParams>
    | JSONRPCResponseBatch<TResult>;

export const JSONRPC_ERROR_CODES = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
} as const;

export const JSONRPC_ERROR_MESSAGES = {
    [JSONRPC_ERROR_CODES.PARSE_ERROR]: 'Parse error',
    [JSONRPC_ERROR_CODES.INVALID_REQUEST]: 'Invalid Request',
    [JSONRPC_ERROR_CODES.METHOD_NOT_FOUND]: 'Method not found',
    [JSONRPC_ERROR_CODES.INVALID_PARAMS]: 'Invalid params',
    [JSONRPC_ERROR_CODES.INTERNAL_ERROR]: 'Internal error',
} as const;

export function createJsonRpcRequest<TParams = unknown>(
    method: string,
    id: string | number,
    params?: TParams,
): JSONRPCRequest<TParams> {
    const request: JSONRPCRequest<TParams> = {
        jsonrpc: '2.0',
        method,
        id,
    };

    if (params !== undefined) {
        request.params = params;
    }

    return request;
}

export function createJsonRpcNotification<TParams = unknown>(
    method: string,
    params?: TParams,
): JSONRPCNotification<TParams> {
    const notification: JSONRPCNotification<TParams> = {
        jsonrpc: '2.0',
        method,
    };

    if (params !== undefined) {
        notification.params = params;
    }

    return notification;
}

export function createJsonRpcSuccessResponse<TResult = unknown>(
    id: string | number,
    result: TResult,
): JSONRPCSuccessResponse<TResult> {
    return {
        jsonrpc: '2.0',
        id,
        result,
    };
}

export function createJsonRpcErrorResponse(
    id: string | number | null,
    error: JSONRPCError,
): JSONRPCErrorResponse {
    return {
        jsonrpc: '2.0',
        id,
        error,
    };
}

export function createJsonRpcError(
    code: number,
    message: string,
    data?: unknown,
): JSONRPCError {
    const error: JSONRPCError = {
        code,
        message,
    };

    if (data !== undefined) {
        error.data = data;
    }

    return error;
}

export function createStandardJsonRpcError(
    code: keyof typeof JSONRPC_ERROR_CODES,
    data?: unknown,
): JSONRPCError {
    const errorCode = JSONRPC_ERROR_CODES[code];
    const message = JSONRPC_ERROR_MESSAGES[errorCode];
    return createJsonRpcError(errorCode, message, data);
}

export function isJSONRPCRequest(obj: unknown): obj is JSONRPCRequest {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'jsonrpc' in obj &&
        obj.jsonrpc === '2.0' &&
        'method' in obj &&
        typeof obj.method === 'string' &&
        'id' in obj &&
        (typeof obj.id === 'string' || typeof obj.id === 'number')
    );
}

export function isJSONRPCNotification(obj: unknown): obj is JSONRPCNotification {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'jsonrpc' in obj &&
        obj.jsonrpc === '2.0' &&
        'method' in obj &&
        typeof obj.method === 'string' &&
        !('id' in obj)
    );
}

export function isJSONRPCSuccessResponse(obj: unknown): obj is JSONRPCSuccessResponse {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'jsonrpc' in obj &&
        obj.jsonrpc === '2.0' &&
        'result' in obj &&
        'id' in obj &&
        (typeof obj.id === 'string' || typeof obj.id === 'number') &&
        !('error' in obj)
    );
}

export function isJSONRPCErrorResponse(obj: unknown): obj is JSONRPCErrorResponse {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'jsonrpc' in obj &&
        obj.jsonrpc === '2.0' &&
        'error' in obj &&
        typeof obj.error === 'object' &&
        obj.error !== null &&
        'code' in obj.error &&
        typeof obj.error.code === 'number' &&
        'message' in obj.error &&
        typeof obj.error.message === 'string' &&
        'id' in obj &&
        (obj.id === null || typeof obj.id === 'string' || typeof obj.id === 'number') &&
        !('result' in obj)
    );
}

export function isJSONRPCResponse(obj: unknown): obj is JSONRPCResponse {
    return isJSONRPCSuccessResponse(obj) || isJSONRPCErrorResponse(obj);
}

export function isJSONRPCError(obj: unknown): obj is JSONRPCError {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'code' in obj &&
        typeof obj.code === 'number' &&
        'message' in obj &&
        typeof obj.message === 'string'
    );
}