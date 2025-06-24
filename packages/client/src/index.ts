import {
    JSONRPCRequest,
    JSONRPCResponse,
    JSONRPCNotification,
} from '@ts-json-rpc/core';

export type JsonRpcClientTransport = (
    request: JSONRPCRequest | JSONRPCRequest[]
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