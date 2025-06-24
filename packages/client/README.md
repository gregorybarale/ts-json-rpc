# @ts-json-rpc/client

Type-safe JSON-RPC 2.0 client implementation.

## Overview

This package provides a transport-agnostic JSON-RPC 2.0 client that handles protocol details while allowing you to provide your own transport layer (HTTP, WebSocket, etc.).

## Installation

```bash
npm install @ts-json-rpc/client @ts-json-rpc/core
```

## Usage

```typescript
import { createJsonRpcClient } from '@ts-json-rpc/client';

// Define your transport function
const transport = async (request) => {
    const response = await fetch('/api/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
    });
    return response.json();
};

// Create client
const client = createJsonRpcClient(transport);

// Make RPC calls
const result = await client.call('add', { a: 1, b: 2 });

// Send notifications (no response expected)
client.notify('log', { message: 'Hello world' });
```

## API

### `createJsonRpcClient(transport: JsonRpcClientTransport): JsonRpcClient`

Creates a new JSON-RPC client with the provided transport function.

### `JsonRpcClient`

- `call<TResult, TParams>(method: string, params?: TParams): Promise<TResult>` - Make an RPC call
- `notify<TParams>(method: string, params?: TParams): void` - Send a notification

### `JsonRpcClientTransport`

Transport function type: `(request: JSONRPCRequest | JSONRPCRequest[]) => Promise<JSONRPCResponse | JSONRPCResponse[]>`

## License

MIT