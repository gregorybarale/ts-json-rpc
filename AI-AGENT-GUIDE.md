# AI/LLM Agent Guide for ts-json-rpc

This guide provides structured information for AI agents and LLMs to understand and work with the ts-json-rpc library effectively.

## 📚 Library Overview

**ts-json-rpc** is a robust, type-safe, and transport-agnostic TypeScript library for building JSON-RPC 2.0 clients and servers.

### Architecture
- **Type**: Monorepo with npm workspaces
- **Packages**: 3 focused packages (core, client, server)
- **Language**: TypeScript with strict mode
- **Testing**: Vitest with high coverage (63 tests)
- **Standards**: JSON-RPC 2.0 specification compliant

### Packages

#### @ts-json-rpc/core
Core types and utilities for JSON-RPC 2.0 implementation.

**Key Exports:**
- `JSONRPCRequest` - Request message interface
- `JSONRPCNotification` - Notification message interface  
- `JSONRPCResponse` - Response message union type
- `JSONRPCError` - Error object interface
- `createJsonRpcRequest()` - Request creation utility
- `createJsonRpcNotification()` - Notification creation utility
- `createJsonRpcError()` - Error creation utility
- `isJSONRPCRequest()` - Type guard for requests
- `isJSONRPCResponse()` - Type guard for responses
- `JSONRPC_ERROR_CODES` - Standard error codes

#### @ts-json-rpc/client
Type-safe JSON-RPC 2.0 client implementation.

**Key Exports:**
- `JsonRpcClient` - Client interface
- `JsonRpcClientTransport` - Transport function type
- `createJsonRpcClient()` - Client factory function

#### @ts-json-rpc/server
Type-safe JSON-RPC 2.0 server implementation.

**Key Exports:**
- `JsonRpcServerInstance` - Server interface
- `JsonRpcMethodHandler` - Method handler function type
- `JsonRpcMethodMap` - Method mapping type
- `JsonRpcServerOptions` - Server configuration options
- `createJsonRpcServer()` - Server factory function

## 🚀 Quick Start Patterns

### Client Setup
```typescript
import { createJsonRpcClient } from '@ts-json-rpc/client';

// Define transport (HTTP example)
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
```

### Server Setup
```typescript
import { createJsonRpcServer } from '@ts-json-rpc/server';

// Define methods
const methods = {
  add: (params: { a: number; b: number }) => params.a + params.b,
  greet: (params: { name: string }, context: { userId?: string }) => 
    `Hello ${params.name}! User: ${context.userId || 'anonymous'}`,
  log: (params: { message: string }) => console.log(params.message),
};

// Create server
const server = createJsonRpcServer(methods, {
  strictMethodHandling: true,
  logger: console,
});
```

### Making Requests
```typescript
// RPC call (expects response)
const result = await client.call<number>('add', { a: 1, b: 2 });
console.log(result); // 3

// Notification (no response expected)
client.notify('log', { message: 'Hello world' });
```

### Handling Requests (Server)
```typescript
// Express.js integration
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

## 🔌 Transport Integration

### HTTP Transport (Fetch)
```typescript
const httpTransport = async (request) => {
  const response = await fetch('/api/jsonrpc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return response.json();
};
```

### WebSocket Transport
```typescript
const wsTransport = async (request) => {
  return new Promise((resolve, reject) => {
    websocket.send(JSON.stringify(request));
    websocket.onmessage = (event) => {
      try {
        resolve(JSON.parse(event.data));
      } catch (error) {
        reject(error);
      }
    };
  });
};
```

### HTTP Transport (Node.js)
```typescript
import { request } from 'http';

const nodeTransport = async (payload) => {
  return new Promise((resolve, reject) => {
    const req = request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/jsonrpc',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.write(JSON.stringify(payload));
    req.end();
  });
};
```

## 🛠️ Advanced Usage

### Batch Requests
```typescript
// Client automatically handles arrays
const requests = [
  { jsonrpc: '2.0', method: 'add', params: { a: 1, b: 2 }, id: 1 },
  { jsonrpc: '2.0', method: 'multiply', params: { a: 3, b: 4 }, id: 2 }
];

// Server handles batch automatically
const responses = await server.handleJsonRpcRequest(requests);
```

### Context Passing
```typescript
// Server method with context
const methods = {
  getUserData: async (params: { userId: string }, context: { currentUser: User }) => {
    if (context.currentUser.role !== 'admin' && params.userId !== context.currentUser.id) {
      throw createJsonRpcError(-32001, 'Access denied');
    }
    return await getUserById(params.userId);
  }
};

// Pass context when handling requests
const response = await server.handleJsonRpcRequest(request, {
  currentUser: req.user,
  requestId: req.id
});
```

### Error Handling
```typescript
// Client error handling
try {
  const result = await client.call('riskyMethod', params);
} catch (error) {
  console.log('RPC Error:', error.code, error.message);
  if (error.data) {
    console.log('Additional info:', error.data);
  }
}

// Server error handling
const methods = {
  divide: (params: { a: number; b: number }) => {
    if (params.b === 0) {
      throw createJsonRpcError(-32602, 'Division by zero', { 
        field: 'b', 
        value: params.b 
      });
    }
    return params.a / params.b;
  }
};
```

## 🧪 Testing Patterns

### Client Testing
```typescript
import { vi } from 'vitest';
import { createJsonRpcClient } from '@ts-json-rpc/client';

// Mock transport
const mockTransport = vi.fn();
const client = createJsonRpcClient(mockTransport);

// Test successful call
mockTransport.mockResolvedValue({ jsonrpc: '2.0', result: 42, id: 1 });
const result = await client.call('test', {});
expect(result).toBe(42);

// Test error handling
mockTransport.mockResolvedValue({ 
  jsonrpc: '2.0', 
  error: { code: -32601, message: 'Method not found' }, 
  id: 1 
});
await expect(client.call('unknown', {})).rejects.toThrow('Method not found');
```

### Server Testing
```typescript
import { createJsonRpcServer } from '@ts-json-rpc/server';

const methods = {
  add: (params: { a: number; b: number }) => params.a + params.b
};
const server = createJsonRpcServer(methods);

// Test successful request
const response = await server.handleJsonRpcRequest({
  jsonrpc: '2.0',
  method: 'add',
  params: { a: 1, b: 2 },
  id: 1
});
expect(response).toEqual({ jsonrpc: '2.0', result: 3, id: 1 });

// Test notification (no response)
const notificationResponse = await server.handleJsonRpcRequest({
  jsonrpc: '2.0',
  method: 'add',
  params: { a: 1, b: 2 }
});
expect(notificationResponse).toBeNull();
```

## ⚠️ Common Issues & Solutions

### Method Not Found
**Problem:** Server returns "Method not found" error
**Solution:** Ensure method name exists in server methods map

```typescript
const methods = {
  'user.get': (params) => getUserById(params.id), // Note: dots allowed in method names
  'user.create': (params) => createUser(params),
};
```

### Invalid Params
**Problem:** Server returns "Invalid params" error
**Solution:** Validate parameters match method handler expectations

```typescript
const methods = {
  add: (params) => {
    if (typeof params?.a !== 'number' || typeof params?.b !== 'number') {
      throw createStandardJsonRpcError('INVALID_PARAMS', { 
        expected: '{ a: number, b: number }',
        received: params 
      });
    }
    return params.a + params.b;
  }
};
```

### Transport Errors
**Problem:** Network or transport failures
**Solution:** Implement proper error handling and retries

```typescript
const robustTransport = async (request, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch('/api/jsonrpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## 📝 Best Practices

1. **Type Safety**: Always use TypeScript with strict mode enabled
2. **Error Handling**: Implement comprehensive error handling in transport and methods
3. **Validation**: Validate parameters in method handlers before processing
4. **Context**: Use context for authentication, logging, and request metadata
5. **Testing**: Test both success and error scenarios thoroughly
6. **Logging**: Configure appropriate logging for debugging and monitoring
7. **Batch Operations**: Use batch requests for related operations to reduce round trips
8. **Notifications**: Use notifications for fire-and-forget operations
9. **Method Naming**: Use clear, descriptive method names
10. **Documentation**: Document all public methods with JSDoc comments

## 🔧 Development Commands

```bash
# Build all packages
npm run build

# Run tests with coverage
npm test

# Lint code
npm run lint

# Format code
npm run format

# Generate documentation
npm run docs

# Generate changelog
npm run changelog
```

## 📊 Package Information

- **Total Tests**: 63 unit tests across all packages
- **Coverage**: High coverage targeting 80%+ 
- **Dependencies**: Minimal runtime dependencies
- **Node.js**: Requires Node.js >= 20.0.0
- **TypeScript**: Uses TypeScript 5.8+ with strict mode
- **Build**: ES modules with TypeScript compilation
- **Standards**: Follows JSON-RPC 2.0 specification exactly

This guide provides comprehensive information for AI agents to understand, implement, and troubleshoot JSON-RPC applications using the ts-json-rpc library.