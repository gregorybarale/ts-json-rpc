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