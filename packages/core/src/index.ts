/**
 * JSON-RPC 2.0 request message interface.
 * 
 * @template TParams The type of the parameters object
 * 
 * @example
 * ```typescript
 * const request: JSONRPCRequest<{ a: number; b: number }> = {
 *   jsonrpc: '2.0',
 *   method: 'add',
 *   params: { a: 1, b: 2 },
 *   id: 1
 * };
 * ```
 */
export interface JSONRPCRequest<TParams = unknown> {
    /** JSON-RPC version identifier. Must be exactly "2.0" */
    jsonrpc: '2.0';
    /** Name of the method to be invoked */
    method: string;
    /** Parameters to be passed to the method (optional) */
    params?: TParams;
    /** Unique identifier for the request */
    id: string | number;
}

/**
 * JSON-RPC 2.0 notification message interface.
 * Notifications are requests without an ID that do not expect a response.
 * 
 * @template TParams The type of the parameters object
 * 
 * @example
 * ```typescript
 * const notification: JSONRPCNotification<{ message: string }> = {
 *   jsonrpc: '2.0',
 *   method: 'log',
 *   params: { message: 'Hello world' }
 * };
 * ```
 */
export interface JSONRPCNotification<TParams = unknown> {
    /** JSON-RPC version identifier. Must be exactly "2.0" */
    jsonrpc: '2.0';
    /** Name of the method to be invoked */
    method: string;
    /** Parameters to be passed to the method (optional) */
    params?: TParams;
}

/**
 * JSON-RPC 2.0 error object interface.
 * Contains information about an error that occurred during request processing.
 * 
 * @example
 * ```typescript
 * const error: JSONRPCError = {
 *   code: -32602,
 *   message: 'Invalid params',
 *   data: { details: 'Missing required field "name"' }
 * };
 * ```
 */
export interface JSONRPCError {
    /** Error code indicating the type of error */
    code: number;
    /** Human-readable error message */
    message: string;
    /** Additional error information (optional) */
    data?: unknown;
}

/**
 * JSON-RPC 2.0 success response message interface.
 * 
 * @template TResult The type of the result value
 * 
 * @example
 * ```typescript
 * const response: JSONRPCSuccessResponse<number> = {
 *   jsonrpc: '2.0',
 *   result: 42,
 *   id: 1
 * };
 * ```
 */
export interface JSONRPCSuccessResponse<TResult = unknown> {
    /** JSON-RPC version identifier. Must be exactly "2.0" */
    jsonrpc: '2.0';
    /** Result of the method invocation */
    result: TResult;
    /** ID that matches the original request */
    id: string | number;
}

/**
 * JSON-RPC 2.0 error response message interface.
 * 
 * @example
 * ```typescript
 * const errorResponse: JSONRPCErrorResponse = {
 *   jsonrpc: '2.0',
 *   error: { code: -32601, message: 'Method not found' },
 *   id: 1
 * };
 * ```
 */
export interface JSONRPCErrorResponse {
    /** JSON-RPC version identifier. Must be exactly "2.0" */
    jsonrpc: '2.0';
    /** Error information */
    error: JSONRPCError;
    /** ID that matches the original request, or null if the request was invalid */
    id: string | number | null;
}

/**
 * Union type representing any JSON-RPC 2.0 response message.
 * 
 * @template TResult The type of the result value for success responses
 */
export type JSONRPCResponse<TResult = unknown> =
    | JSONRPCSuccessResponse<TResult>
    | JSONRPCErrorResponse;

/** Array of JSON-RPC request messages for batch operations */
export type JSONRPCRequestBatch<TParams = unknown> = JSONRPCRequest<TParams>[];

/** Array of JSON-RPC notification messages for batch operations */
export type JSONRPCNotificationBatch<TParams = unknown> = JSONRPCNotification<TParams>[];

/** Array of JSON-RPC response messages for batch operations */
export type JSONRPCResponseBatch<TResult = unknown> = JSONRPCResponse<TResult>[];

/**
 * Union type representing any JSON-RPC 2.0 message.
 * 
 * @template TParams The type of parameters for requests/notifications
 * @template TResult The type of results for responses
 */
export type JSONRPCMessage<TParams = unknown, TResult = unknown> =
    | JSONRPCRequest<TParams>
    | JSONRPCNotification<TParams>
    | JSONRPCResponse<TResult>
    | JSONRPCRequestBatch<TParams>
    | JSONRPCNotificationBatch<TParams>
    | JSONRPCResponseBatch<TResult>;

/**
 * Standard JSON-RPC 2.0 error codes as defined in the specification.
 * 
 * @see https://www.jsonrpc.org/specification#error_object
 */
export const JSONRPC_ERROR_CODES = {
    /** Invalid JSON was received by the server */
    PARSE_ERROR: -32700,
    /** The JSON sent is not a valid Request object */
    INVALID_REQUEST: -32600,
    /** The method does not exist / is not available */
    METHOD_NOT_FOUND: -32601,
    /** Invalid method parameter(s) */
    INVALID_PARAMS: -32602,
    /** Internal JSON-RPC error */
    INTERNAL_ERROR: -32603,
} as const;

/**
 * Standard JSON-RPC 2.0 error messages corresponding to error codes.
 */
export const JSONRPC_ERROR_MESSAGES = {
    [JSONRPC_ERROR_CODES.PARSE_ERROR]: 'Parse error',
    [JSONRPC_ERROR_CODES.INVALID_REQUEST]: 'Invalid Request',
    [JSONRPC_ERROR_CODES.METHOD_NOT_FOUND]: 'Method not found',
    [JSONRPC_ERROR_CODES.INVALID_PARAMS]: 'Invalid params',
    [JSONRPC_ERROR_CODES.INTERNAL_ERROR]: 'Internal error',
} as const;

/**
 * Creates a JSON-RPC 2.0 request message.
 * 
 * @template TParams The type of the parameters object
 * @param method The name of the method to be invoked
 * @param id Unique identifier for the request
 * @param params Optional parameters to be passed to the method
 * @returns A properly formatted JSON-RPC request message
 * 
 * @example
 * ```typescript
 * const request = createJsonRpcRequest('add', 1, { a: 1, b: 2 });
 * // Returns: { jsonrpc: '2.0', method: 'add', params: { a: 1, b: 2 }, id: 1 }
 * ```
 */
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

/**
 * Creates a JSON-RPC 2.0 notification message.
 * Notifications are fire-and-forget messages that do not expect a response.
 * 
 * @template TParams The type of the parameters object
 * @param method The name of the method to be invoked
 * @param params Optional parameters to be passed to the method
 * @returns A properly formatted JSON-RPC notification message
 * 
 * @example
 * ```typescript
 * const notification = createJsonRpcNotification('log', { message: 'Hello world' });
 * // Returns: { jsonrpc: '2.0', method: 'log', params: { message: 'Hello world' } }
 * ```
 */
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

/**
 * Creates a JSON-RPC 2.0 success response message.
 * 
 * @template TResult The type of the result value
 * @param id The ID that matches the original request
 * @param result The result of the method invocation
 * @returns A properly formatted JSON-RPC success response message
 * 
 * @example
 * ```typescript
 * const response = createJsonRpcSuccessResponse(1, 42);
 * // Returns: { jsonrpc: '2.0', result: 42, id: 1 }
 * ```
 */
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

/**
 * Creates a JSON-RPC 2.0 error response message.
 * 
 * @param id The ID that matches the original request, or null if the request was invalid
 * @param error The error information
 * @returns A properly formatted JSON-RPC error response message
 * 
 * @example
 * ```typescript
 * const error = createJsonRpcError(-32601, 'Method not found');
 * const response = createJsonRpcErrorResponse(1, error);
 * // Returns: { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id: 1 }
 * ```
 */
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

/**
 * Creates a JSON-RPC 2.0 error object.
 * 
 * @param code The error code
 * @param message Human-readable error message
 * @param data Optional additional error information
 * @returns A properly formatted JSON-RPC error object
 * 
 * @example
 * ```typescript
 * const error = createJsonRpcError(-32602, 'Invalid params', { details: 'Missing field' });
 * // Returns: { code: -32602, message: 'Invalid params', data: { details: 'Missing field' } }
 * ```
 */
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

/**
 * Creates a standard JSON-RPC 2.0 error object using predefined error codes.
 * 
 * @param code The standard error code key
 * @param data Optional additional error information
 * @returns A properly formatted JSON-RPC error object with standard code and message
 * 
 * @example
 * ```typescript
 * const error = createStandardJsonRpcError('PARSE_ERROR');
 * // Returns: { code: -32700, message: 'Parse error' }
 * 
 * const errorWithData = createStandardJsonRpcError('INVALID_PARAMS', { field: 'name' });
 * // Returns: { code: -32602, message: 'Invalid params', data: { field: 'name' } }
 * ```
 */
export function createStandardJsonRpcError(
    code: keyof typeof JSONRPC_ERROR_CODES,
    data?: unknown,
): JSONRPCError {
    const errorCode = JSONRPC_ERROR_CODES[code];
    const message = JSONRPC_ERROR_MESSAGES[errorCode];
    return createJsonRpcError(errorCode, message, data);
}

/**
 * Type guard to check if an object is a valid JSON-RPC request.
 * 
 * @param obj The object to check
 * @returns True if the object is a valid JSON-RPC request
 * 
 * @example
 * ```typescript
 * const obj = { jsonrpc: '2.0', method: 'add', id: 1 };
 * if (isJSONRPCRequest(obj)) {
 *   // obj is now typed as JSONRPCRequest
 *   console.log(obj.method); // TypeScript knows this is safe
 * }
 * ```
 */
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

/**
 * Type guard to check if an object is a valid JSON-RPC notification.
 * 
 * @param obj The object to check
 * @returns True if the object is a valid JSON-RPC notification
 * 
 * @example
 * ```typescript
 * const obj = { jsonrpc: '2.0', method: 'log' };
 * if (isJSONRPCNotification(obj)) {
 *   // obj is now typed as JSONRPCNotification
 *   console.log(obj.method); // TypeScript knows this is safe
 * }
 * ```
 */
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

/**
 * Type guard to check if an object is a valid JSON-RPC success response.
 * 
 * @param obj The object to check
 * @returns True if the object is a valid JSON-RPC success response
 * 
 * @example
 * ```typescript
 * const obj = { jsonrpc: '2.0', result: 42, id: 1 };
 * if (isJSONRPCSuccessResponse(obj)) {
 *   // obj is now typed as JSONRPCSuccessResponse
 *   console.log(obj.result); // TypeScript knows this is safe
 * }
 * ```
 */
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

/**
 * Type guard to check if an object is a valid JSON-RPC error response.
 * 
 * @param obj The object to check
 * @returns True if the object is a valid JSON-RPC error response
 * 
 * @example
 * ```typescript
 * const obj = { jsonrpc: '2.0', error: { code: -32601, message: 'Method not found' }, id: 1 };
 * if (isJSONRPCErrorResponse(obj)) {
 *   // obj is now typed as JSONRPCErrorResponse
 *   console.log(obj.error.code); // TypeScript knows this is safe
 * }
 * ```
 */
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

/**
 * Type guard to check if an object is a valid JSON-RPC response (success or error).
 * 
 * @param obj The object to check
 * @returns True if the object is a valid JSON-RPC response
 * 
 * @example
 * ```typescript
 * const obj = { jsonrpc: '2.0', result: 42, id: 1 };
 * if (isJSONRPCResponse(obj)) {
 *   // obj is now typed as JSONRPCResponse
 *   if (isJSONRPCSuccessResponse(obj)) {
 *     console.log(obj.result);
 *   } else {
 *     console.log(obj.error);
 *   }
 * }
 * ```
 */
export function isJSONRPCResponse(obj: unknown): obj is JSONRPCResponse {
    return isJSONRPCSuccessResponse(obj) || isJSONRPCErrorResponse(obj);
}

/**
 * Type guard to check if an object is a valid JSON-RPC error object.
 * 
 * @param obj The object to check
 * @returns True if the object is a valid JSON-RPC error object
 * 
 * @example
 * ```typescript
 * const obj = { code: -32601, message: 'Method not found' };
 * if (isJSONRPCError(obj)) {
 *   // obj is now typed as JSONRPCError
 *   console.log(obj.code); // TypeScript knows this is safe
 * }
 * ```
 */
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