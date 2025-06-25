# ts-json-rpc

A robust, type-safe, and transport-agnostic TypeScript library for building JSON-RPC 2.0 clients and servers.

## 🚀 Features

- **Type-Safe**: Full TypeScript support with strict typing for requests, responses, and errors
- **JSON-RPC 2.0 Compliant**: Strict adherence to the [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- **Transport Agnostic**: Works with any transport layer (HTTP, WebSocket, etc.)
- **Monorepo Architecture**: Three focused packages for different use cases
- **Comprehensive Error Handling**: Standard and custom JSON-RPC errors
- **Batch Request Support**: Handle multiple requests in a single call
- **Notification Support**: Fire-and-forget notifications
- **Context Support**: Pass context data to server method handlers
- **Extensive Testing**: 63 unit tests with high coverage
- **Modern TypeScript**: ES modules, strict mode, and latest features

## 📦 Packages

This is a monorepo containing three packages:

### [@ts-json-rpc/core](./packages/core)
Core types and utilities for JSON-RPC 2.0 implementation.

```bash
npm install @ts-json-rpc/core
```

### [@ts-json-rpc/client](./packages/client)
Type-safe JSON-RPC 2.0 client implementation.

```bash
npm install @ts-json-rpc/client @ts-json-rpc/core
```

### [@ts-json-rpc/server](./packages/server)
Type-safe JSON-RPC 2.0 server implementation.

```bash
npm install @ts-json-rpc/server @ts-json-rpc/core
```

## 🏃‍♂️ Quick Start

### Client Example

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
const result = await client.call<number>('add', { a: 1, b: 2 });
console.log(result); // 3

// Send notifications (no response expected)
client.notify('log', { message: 'Hello world' });
```

### Server Example

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
    
    log: (params: { message: string }) => {
        console.log('Received log:', params.message);
    },
};

// Create server
const server = createJsonRpcServer(methods, {
    strictMethodHandling: true,
    logger: console,
});

// Handle incoming requests (Express example)
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

### Core Types Example

```typescript
import {
    createJsonRpcRequest,
    createJsonRpcNotification,
    createJsonRpcError,
    isJSONRPCRequest,
    isJSONRPCResponse,
    JSONRPC_ERROR_CODES,
} from '@ts-json-rpc/core';

// Create requests
const request = createJsonRpcRequest('add', 1, { a: 1, b: 2 });
const notification = createJsonRpcNotification('log', { message: 'test' });

// Create errors
const customError = createJsonRpcError(-32001, 'Custom error', { details: 'Something went wrong' });

// Type guards
if (isJSONRPCRequest(someObject)) {
    console.log('This is a JSON-RPC request');
}

// Standard error codes
const parseError = JSONRPC_ERROR_CODES.PARSE_ERROR; // -32700
```

## 🛠️ Development

### Prerequisites

- Node.js >= 20.0.0
- npm

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd ts-json-rpc

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format
```

### Project Structure

```
ts-json-rpc/
├── packages/
│   ├── core/          # Core types and utilities
│   ├── client/        # JSON-RPC client
│   └── server/        # JSON-RPC server
├── .eslintrc.js       # ESLint configuration
├── .prettierrc.js     # Prettier configuration
├── tsconfig.json      # Base TypeScript configuration
└── package.json       # Root package configuration
```

### Scripts

- `npm run build` - Build all packages
- `npm test` - Run tests for all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code with Prettier

## 📋 Requirements

- **Node.js**: Version 20.0.0 or higher
- **TypeScript**: 5.0+ (for development)
- **Transport**: You provide your own transport implementation

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

This project follows the **Git Flow** workflow:

1. **Fork the repository**
2. **Set up Git Flow**:
   ```bash
   git flow init  # Accept defaults
   ```
3. **Start a feature**:
   ```bash
   git flow feature start your-feature-name
   # Or manually: git checkout -b feature/your-feature-name develop
   ```
4. **Make your changes**
5. **Test thoroughly**:
   ```bash
   npm run build
   npm test
   npm run lint
   ```
6. **Commit using conventional commits**: `feat: add new feature`
7. **Finish feature and create PR**:
   ```bash
   git flow feature finish your-feature-name
   # Then create PR from feature/your-feature-name to develop
   ```

For detailed Git Flow guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

MIT - see [LICENSE.md](./LICENSE.md) for details.

## 🙏 Acknowledgments

- Built following the [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification)
- Inspired by modern TypeScript best practices
- Designed for maximum type safety and developer experience