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

export type JsonRpcClientTransport = (
    request: JSONRPCRequest | JSONRPCNotification | (JSONRPCRequest | JSONRPCNotification)[]
) => Promise<JSONRPCResponse | JSONRPCResponse[]>;

export interface JsonRpcClient {
    call<TResult = unknown, TParams = unknown>(
        method: string,
        params?: TParams
    ): Promise<TResult>;
    
    notify<TParams = unknown>(
        method: string,
        params?: TParams
    ): void;
}

type PendingRequest = {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
};

export function createJsonRpcClient(transport: JsonRpcClientTransport): JsonRpcClient {
    let nextId = 1;
    const pendingRequests = new Map<string | number, PendingRequest>();

    function generateId(): number {
        return nextId++;
    }

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

    function handleResponse(response: JSONRPCResponse | JSONRPCResponse[], requestId: string | number): void {
        if (Array.isArray(response)) {
            for (const singleResponse of response) {
                handleSingleResponse(singleResponse);
            }
        } else {
            handleSingleResponse(response);
        }
    }

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