# @ts-json-rpc/core

Core types and utilities for JSON-RPC 2.0 implementation.

## Overview

This package provides the fundamental TypeScript types and interfaces that strictly adhere to the [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification). It serves as the foundation for the `@ts-json-rpc/client` and `@ts-json-rpc/server` packages.

## Installation

```bash
npm install @ts-json-rpc/core
```

## Types

### Core Message Types

- `JSONRPCRequest<TParams>` - JSON-RPC request message
- `JSONRPCNotification<TParams>` - JSON-RPC notification message (no response expected)
- `JSONRPCSuccessResponse<TResult>` - JSON-RPC success response message
- `JSONRPCErrorResponse` - JSON-RPC error response message
- `JSONRPCResponse<TResult>` - Union of success and error response types

### Batch Types

- `JSONRPCRequestBatch<TParams>` - Array of JSON-RPC requests
- `JSONRPCNotificationBatch<TParams>` - Array of JSON-RPC notifications
- `JSONRPCResponseBatch<TResult>` - Array of JSON-RPC responses

### Error Types

- `JSONRPCError` - JSON-RPC error object structure

## Constants

- `JSONRPC_ERROR_CODES` - Standard JSON-RPC error codes
- `JSONRPC_ERROR_MESSAGES` - Standard JSON-RPC error messages

## License

MIT