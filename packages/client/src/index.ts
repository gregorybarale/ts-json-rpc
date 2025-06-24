import {
    JSONRPCRequest,
    JSONRPCResponse,
    JSONRPCNotification,
    JSONRPCSuccessResponse,
    JSONRPCErrorResponse,
    createJsonRpcRequest,
    createJsonRpcNotification,
    isJSONRPCSuccessResponse,
    isJSONRPCErrorResponse,
} from '@ts-json-rpc/core';

/**
 * Transport function type for JSON-RPC client.
 * This function is responsible for sending JSON-RPC requests/notifications to the server
 * and returning the responses. It abstracts the underlying transport mechanism (HTTP, WebSocket, etc.).
 * 
 * @param request A single request/notification or an array of requests/notifications for batch processing
 * @returns A promise that resolves to a single response or array of responses
 * 
 * @example
 * ```typescript
 * const httpTransport: JsonRpcClientTransport = async (request) => {
 *   const response = await fetch('/api/jsonrpc', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(request),
 *   });
 *   return response.json();
 * };
 * ```
 */
export type JsonRpcClientTransport = (
    request: JSONRPCRequest | JSONRPCNotification | (JSONRPCRequest | JSONRPCNotification)[]
) => Promise<JSONRPCResponse | JSONRPCResponse[]>;

/**
 * JSON-RPC client interface providing methods for making RPC calls and sending notifications.
 * 
 * @example
 * ```typescript
 * const client = createJsonRpcClient(transport);
 * 
 * // Make a call that expects a response
 * const result = await client.call<number>('add', { a: 1, b: 2 });
 * 
 * // Send a notification (no response expected)
 * client.notify('log', { message: 'Hello world' });
 * ```
 */
export interface JsonRpcClient {
    /**
     * Makes a JSON-RPC call and waits for a response.
     * 
     * @template TResult The expected type of the result
     * @template TParams The type of the parameters object
     * @param method The name of the remote method to call
     * @param params Optional parameters to pass to the method
     * @returns A promise that resolves to the method result or rejects with an error
     * 
     * @example
     * ```typescript
     * const result = await client.call<number>('add', { a: 1, b: 2 });
     * console.log(result); // 3
     * ```
     */
    call<TResult = unknown, TParams = unknown>(
        method: string,
        params?: TParams
    ): Promise<TResult>;
    
    /**
     * Sends a JSON-RPC notification (fire-and-forget).
     * Notifications do not expect a response and any errors are logged to console.
     * 
     * @template TParams The type of the parameters object
     * @param method The name of the remote method to call
     * @param params Optional parameters to pass to the method
     * 
     * @example
     * ```typescript
     * client.notify('log', { message: 'Operation completed' });
     * client.notify('updateStatus', { status: 'active' });
     * ```
     */
    notify<TParams = unknown>(
        method: string,
        params?: TParams
    ): void;
}

/**
 * Internal type representing a pending request waiting for a response.
 * Stores the resolve and reject functions for the promise returned by the call method.
 * 
 * @internal
 */
type PendingRequest = {
    /** Function to resolve the promise with the result */
    resolve: (value: unknown) => void;
    /** Function to reject the promise with an error */
    reject: (reason?: unknown) => void;
};

/**
 * Creates a JSON-RPC 2.0 client with the provided transport function.
 * The client manages request IDs, handles responses, and provides a simple interface
 * for making RPC calls and sending notifications.
 * 
 * @param transport The transport function to use for sending requests
 * @returns A JSON-RPC client instance
 * 
 * @example
 * ```typescript
 * // HTTP transport example
 * const httpTransport: JsonRpcClientTransport = async (request) => {
 *   const response = await fetch('/api/jsonrpc', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(request),
 *   });
 *   return response.json();
 * };
 * 
 * const client = createJsonRpcClient(httpTransport);
 * 
 * // Use the client
 * const result = await client.call('add', { a: 1, b: 2 });
 * client.notify('log', { message: 'Hello world' });
 * ```
 */
export function createJsonRpcClient(transport: JsonRpcClientTransport): JsonRpcClient {
    let nextId = 1;
    const pendingRequests = new Map<string | number, PendingRequest>();

    /**
     * Generates a unique ID for the next request.
     * Uses a simple incrementing counter starting from 1.
     * 
     * @returns A unique numeric ID
     */
    function generateId(): number {
        return nextId++;
    }

    /**
     * Implementation of the call method that sends a JSON-RPC request and waits for a response.
     * Manages the request ID, stores the pending promise, and handles the response.
     * 
     * @template TResult The expected type of the result
     * @template TParams The type of the parameters object
     * @param method The name of the remote method to call
     * @param params Optional parameters to pass to the method
     * @returns A promise that resolves to the method result or rejects with an error
     */
    async function call<TResult = unknown, TParams = unknown>(
        method: string,
        params?: TParams
    ): Promise<TResult> {
        const id = generateId();
        const request = createJsonRpcRequest(method, id, params);

        return new Promise<TResult>((resolve, reject) => {
            pendingRequests.set(id, { 
                resolve: resolve as (value: unknown) => void, 
                reject 
            });

            transport(request)
                .then((response) => {
                    handleResponse(response, id);
                })
                .catch((error) => {
                    const pending = pendingRequests.get(id);
                    if (pending) {
                        pendingRequests.delete(id);
                        pending.reject(error);
                    }
                });
        });
    }

    /**
     * Handles the response from the transport, supporting both single responses and batch responses.
     * Delegates to handleSingleResponse for each individual response.
     * 
     * @param response The response or array of responses from the server
     * @param requestId The ID of the original request (used for error context)
     */
    function handleResponse(response: JSONRPCResponse | JSONRPCResponse[], requestId: string | number): void {
        if (Array.isArray(response)) {
            for (const singleResponse of response) {
                handleSingleResponse(singleResponse);
            }
        } else {
            handleSingleResponse(response);
        }
    }

    /**
     * Handles a single JSON-RPC response by resolving or rejecting the corresponding pending request.
     * Extracts the result from success responses or creates Error objects from error responses.
     * 
     * @param response The JSON-RPC response to handle
     */
    function handleSingleResponse(response: JSONRPCResponse): void {
        const id = response.id;
        
        if (id === null) {
            return;
        }
        
        const pending = pendingRequests.get(id);
        
        if (!pending) {
            return;
        }

        pendingRequests.delete(id);

        if (isJSONRPCSuccessResponse(response)) {
            pending.resolve(response.result);
        } else if (isJSONRPCErrorResponse(response)) {
            const error = new Error(response.error.message);
            (error as any).code = response.error.code;
            (error as any).data = response.error.data;
            pending.reject(error);
        }
    }

    /**
     * Implementation of the notify method that sends a JSON-RPC notification.
     * Notifications are fire-and-forget and do not expect a response.
     * Transport errors are logged to console but do not throw.
     * 
     * @template TParams The type of the parameters object
     * @param method The name of the remote method to call
     * @param params Optional parameters to pass to the method
     */
    function notify<TParams = unknown>(method: string, params?: TParams): void {
        const notification = createJsonRpcNotification(method, params);
        
        transport(notification)
            .catch((error) => {
                console.warn('JSON-RPC notification transport error:', error);
            });
    }

    return {
        call,
        notify,
    };
}