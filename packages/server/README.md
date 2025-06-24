# @ts-json-rpc/server

Type-safe JSON-RPC 2.0 server implementation.

## Overview

This package provides a transport-agnostic JSON-RPC 2.0 server that handles protocol details while allowing you to define your own method handlers and context.

## Installation

```bash
npm install @ts-json-rpc/server @ts-json-rpc/core
```

## Usage

```typescript
import { createJsonRpcServer } from '@ts-json-rpc/server';

// Define your method handlers
const methods = {
    add: (params: { a: number; b: number }) => {
        return params.a + params.b;
    },
    
    subtract: async (params: { a: number; b: number }) => {
        return params.a - params.b;
    },
    
    greet: (params: { name: string }, context: { userId?: string }) => {
        return `Hello, ${params.name}! User ID: ${context.userId || 'anonymous'}`;
    },
};

// Create server
const server = createJsonRpcServer(methods, {
    strictMethodHandling: true,
    logger: console,
});

// Handle incoming requests
app.post('/api/jsonrpc', async (req, res) => {
    const response = await server.handleJsonRpcRequest(req.body, {
        userId: req.user?.id,
    });
    
    if (response !== null) {
        res.json(response);
    } else {
        res.status(204).send(); // No response for notifications
    }
});
```

## API

### `createJsonRpcServer<TContext>(methods: JsonRpcMethodMap<TContext>, options?: JsonRpcServerOptions): JsonRpcServerInstance`

Creates a new JSON-RPC server with the provided method handlers and options.

### `JsonRpcMethodHandler<TParams, TResult, TContext>`

Type for method handler functions: `(params: TParams, context: TContext) => Promise<TResult> | TResult`

### `JsonRpcServerOptions`

- `logger` - Optional logger with `info`, `warn`, `error` methods (defaults to `console`)
- `strictMethodHandling` - Boolean, default `true`. If `true`, calls to unregistered methods return "Method not found" error

### `JsonRpcServerInstance`

- `handleJsonRpcRequest<TContext>(rawJsonPayload: unknown, context?: TContext): Promise<unknown>` - Process JSON-RPC requests

## Error Handling

The server automatically handles standard JSON-RPC errors:
- Parse Error (-32700): Invalid JSON
- Invalid Request (-32600): Invalid JSON-RPC structure  
- Method Not Found (-32601): Unknown method (when strictMethodHandling is true)
- Invalid Params (-32602): Thrown by method handlers for invalid parameters
- Internal Error (-32603): Unhandled exceptions in method handlers

Method handlers can throw custom errors by using `createJsonRpcError` from `@ts-json-rpc/core`.

## License

MIT