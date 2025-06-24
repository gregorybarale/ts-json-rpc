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