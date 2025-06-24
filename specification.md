# `ts-json-rpc` Project Specification

This document outlines the detailed technical specification for the `ts-json-rpc` project, a TypeScript library for implementing the JSON-RPC 2.0 specification. It covers architecture, development practices, testing, and documentation to ensure a high-quality, open-source product.

## 1. Project Overview

* **Project Name:** `ts-json-rpc`
* **Purpose:** To provide a robust, type-safe, and transport-agnostic TypeScript library for building JSON-RPC 2.0 clients and servers. It will not handle the underlying message transport (e.g., HTTP, WebSockets).
* **Architecture:** The project will be structured as an `npm workspaces` monorepo.
* **Node.js Requirement:** Minimum Node.js version 20.0.0. This will be enforced via the `engines` field in `package.json`.
* **Open Source Best Practices:** The project will adhere to best practices for open-source development, including strict code quality, comprehensive testing, and clear documentation.

## 2. Monorepo Structure

The monorepo will consist of three distinct NPM packages (workspaces), located in a `packages/` directory:

* `@ts-json-rpc/core`
* `@ts-json-rpc/client`
* `@ts-json-rpc/server`

### 2.1. `@ts-json-rpc/core` Workspace

This package will be the foundational library, providing fundamental types and pure utility functions that are shared across the client and server implementations.

* **Responsibilities:**
    * Define all necessary TypeScript types and interfaces to strictly adhere to the [JSON-RPC 2.0 Specification](https://www.jsonrpc.org/specification).
    * Provide pure utility functions for creating, validating, and performing type-guard checks on JSON-RPC messages.
* **Specific Types & Interfaces:**
    * `JSONRPCRequest`: Interface for a JSON-RPC request message, including `id`, `method`, `params`, `jsonrpc: "2.0"`.
    * `JSONRPCNotification`: A variant of `JSONRPCRequest` without an `id` field.
    * `JSONRPCResponse`: Union type for `JSONRPCSuccessResponse` and `JSONRPCErrorResponse`.
    * `JSONRPCSuccessResponse`: Interface for a successful JSON-RPC response, including `id`, `result`, `jsonrpc: "2.0"`.
    * `JSONRPCErrorResponse`: Interface for an error JSON-RPC response, including `id` (or `null`), `error` object, `jsonrpc: "2.0"`.
    * `JSONRPCError`: Interface for the error object, including `code`, `message`, and optional `data`.
    * Types for batch requests (`JSONRPCRequest[]`) and batch responses (`JSONRPCResponse[]`).
* **Specific Utility Functions:**
    * Functions for programmatically constructing `JSONRPCRequest`, `JSONRPCNotification`, `JSONRPCSuccessResponse`, and `JSONRPCErrorResponse` objects.
    * Validation functions (e.g., `isValidJsonRpcRequest(obj: any): boolean`) to check if a given object conforms to the JSON-RPC message structures.
    * Type guard functions (e.g., `isJSONRPCRequest(obj: any): obj is JSONRPCRequest`, `isJSONRPCResponse(obj: any): obj is JSONRPCResponse`, `isJSONRPCErrorResponse(obj: any): obj is JSONRPCErrorResponse`, `isJSONRPCNotification(obj: any): obj is JSONRPCNotification`) for safe type narrowing.
    * A utility function or class (`createJsonRpcError`) for creating standard JSON-RPC errors (Parse Error, Invalid Request, Method Not Found, Invalid Params, Internal Error) and custom application-defined errors, adhering to specified error codes and ranges.

### 2.2. `@ts-json-rpc/client` Workspace

This package will provide the client-side logic for making JSON-RPC calls, abstracting the protocol details from the underlying transport. It will expose a function-based API.

* **Core API:** A factory function `createJsonRpcClient(transport: JsonRpcClientTransport): JsonRpcClient`.
* **`JsonRpcClientTransport` Type:**
    ```typescript
    export type JsonRpcClientTransport = (
      request: JSONRPCRequest | JSONRPCRequest[]
    ) => Promise<JSONRPCResponse | JSONRPCResponse[]>;
    ```
    This function will be responsible for sending the serialized JSON-RPC message over the network and returning the parsed response. The client itself will **not** handle network-specific logic (e.g., `fetch`, `WebSocket`).
* **`JsonRpcClient` Interface (returned by factory):**
    * `call<TResult = unknown, TParams = unknown>(method: string, params?: TParams): Promise<TResult>`:
        * Generates a unique request ID.
        * Constructs a `JSONRPCRequest` object using types from `@ts-json-rpc/core`.
        * Uses the provided `transport` function to send the request.
        * Manages pending requests by ID, resolving or rejecting the returned Promise based on the `JSONRPCResponse` received.
        * Automatically rejects with a `JSONRPCError` object if an error response is received.
        * Handles potential transport-level errors by rejecting the Promise.
    * `notify<TParams = unknown>(method: string, params?: TParams): void`:
        * Constructs a `JSONRPCNotification` object.
        * Uses the provided `transport` function to send the notification.
        * Does not expect or track a response. Any transport errors are logged internally.
* **Request ID Management:** The client will handle the generation of unique request IDs for each `call`.

### 2.3. `@ts-json-rpc/server` Workspace

This package will provide the server-side logic for processing incoming JSON-RPC requests, dispatching them to registered methods, and generating appropriate JSON-RPC responses. It will expose a function-based API.

* **Core API:** A factory function `createJsonRpcServer<TContext = unknown>(methods: JsonRpcMethodMap<TContext>, options?: JsonRpcServerOptions)` returning `{ handleJsonRpcRequest }`.
* **`JsonRpcMethodHandler` Type:**
    ```typescript
    export type JsonRpcMethodHandler<TParams = unknown, TResult = unknown, TContext = unknown> = (
      params: TParams,
      context: TContext,
    ) => Promise<TResult> | TResult;
    ```
    Method handlers can be synchronous or asynchronous. The `context` object allows transport-specific data (e.g., HTTP request headers, authenticated user info) to be passed to the RPC method logic.
* **`JsonRpcMethodMap` Type:** A dictionary mapping method names (strings) to `JsonRpcMethodHandler` functions.
* **`handleJsonRpcRequest` Function:**
    * Takes a raw JSON payload (string, object, or array of objects) and an optional `context` object.
    * Parses the input JSON, handling `ParseError` if the JSON is invalid.
    * Validates the incoming payload against `JSONRPCRequest` or `JSONRPCNotification` structure (`InvalidRequest` error).
    * Supports both single requests and batch requests:
        * For single requests, it dispatches to the appropriate method handler and returns a single `JSONRPCResponse` (or `null` for notifications).
        * For batch requests, it processes each item, collects responses (excluding notifications), and returns an array of `JSONRPCResponse` objects. An empty batch will result in an `InvalidRequest` error.
    * **Method Dispatch:** Locates the corresponding `JsonRpcMethodHandler` from the `methods` map.
    * **Error Handling:**
        * Generates standard JSON-RPC errors (from `@ts-json-rpc/core`) for:
            * `-32700` (Parse error): Invalid JSON.
            * `-32600` (Invalid Request): Invalid JSON-RPC structure or empty batch.
            * `-32601` (Method not found): If `strictMethodHandling` is `true` and the requested method is not registered. Notifications with unfound methods are logged but do not return an error response.
            * `-32602` (Invalid params): Should be thrown *by the method handler itself* if parameters do not match expectations.
            * `-32603` (Internal error): For unhandled exceptions within method handlers or unexpected server-side issues.
        * Supports custom errors: Method handlers can throw instances of `JSONRPCError` (or a custom error class extending it) to return specific application-defined error codes and messages.
* **`JsonRpcServerOptions`:**
    * `logger`: Optional logger (`info`, `warn`, `error` methods) for internal server logging. Defaults to `console`.
    * `strictMethodHandling`: Boolean, default `true`. If `true`, calls to unregistered methods for requests will result in a `Method not found` error.

## 3. Technical & Development Best Practices

### 3.1. Build Process

* **Build Tool:** `tsc` (TypeScript Compiler) will be the sole tool for transpiling TypeScript to JavaScript and generating declaration files. No external bundlers (like Rollup, esbuild) will be used for library compilation.
* **Output Directory:** All compiled JavaScript (`.js` files), source maps (`.map` files), and TypeScript declaration files (`.d.ts` files) will be placed in a `dist/` directory within each workspace package.
* **`package.json` Configuration for Publishing:**
    * Each workspace `package.json` will include:
        * `"type": "module"`: Ensures Node.js treats `.js` files as ES Modules.
        * `"main": "./dist/index.js"`: CommonJS fallback entry point.
        * `"module": "./dist/index.js"`: ES Module entry point.
        * `"types": "./dist/index.d.ts"`: TypeScript declaration file entry point.
        * `"exports"`: Modern way to define package entry points and conditional exports, prioritizing `types` and `import` conditions, with `require` falling back to the ESM build.
            ```json
            "exports": {
              ".": {
                "types": "./dist/index.d.ts",
                "import": "./dist/index.js",
                "require": "./dist/index.js"
              },
              "./package.json": "./package.json"
            }
            ```
        * `"files": ["dist/", "src/", "!src/**/*.spec.ts", "!src/**/*.test.ts"]`: Specifies files to include when publishing to NPM.
        * `"scripts": { "build": "tsc", "prepublishOnly": "npm run build" }`: Standard build script and a pre-publish hook.
* **Root `package.json` scripts:** Will include `build`, `test`, `lint` commands that run across all workspaces (e.g., `npm run build --workspaces`).

### 3.2. TypeScript Configuration (`tsconfig.json`)

A common base `tsconfig.json` will be defined at the root, which each workspace's `tsconfig.json` will extend.

* **Root `tsconfig.json` (common options):**
    ```json
    {
      "compilerOptions": {
        "strict": true,
        "target": "ESNext",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "skipLibCheck": true,
        "lib": ["ESNext"],
        "resolveJsonModule": true,
        "outDir": "./dist", // Placeholder, overridden by workspace configs
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "composite": true // Required for project references in monorepos
      },
      "exclude": ["node_modules", "dist"]
    }
    ```
* **Workspace `tsconfig.json`:** Each package will have its own `tsconfig.json` (e.g., `packages/core/tsconfig.json`) that extends the root, defines `rootDir`, `outDir` (explicitly `./dist`), and `include` paths.
    * `@ts-json-rpc/client`'s `tsconfig.json` will add `"DOM"` to its `lib` array to include browser-specific types.

### 3.3. Code Quality & Consistency

* **ESLint:**
    * **Structure:** Separate `.eslintrc.js` configurations for each workspace, extending a common base ESLint config.
    * **Common Base Config (e.g., `.eslintrc.base.js`):**
        * Extends:
            * `eslint:recommended`
            * `plugin:@typescript-eslint/recommended-type-checked` (for strong type-aware linting)
            * `plugin:import/recommended`
            * `plugin:node/recommended`
        * Integrates `eslint-config-prettier` to disable conflicting formatting rules.
    * **Usage:** Linting will be run via `npm run lint` script, supporting `.ts` and `.tsx` extensions.
* **Prettier:**
    * **Structure:** A single, root-level `.prettierrc.js` file for consistent formatting across the entire monorepo.
    * **Configuration:**
        ```javascript
        // .prettierrc.js
        module.exports = {
          semi: true,
          singleQuote: true,
          tabWidth: 4,
          trailingComma: 'all',
        };
        ```
* **Conventional Commits Enforcement:**
    * **Tools:** `husky` (for Git hooks) and `commitlint` (for commit message validation).
    * **Setup:**
        * `husky` and `commitlint` will be added as `devDependencies` in the root `package.json`.
        * A `prepare` script in the root `package.json` (`"prepare": "husky install"`) will ensure Husky hooks are installed.
        * A `commit-msg` Git hook will be configured (typically in `.husky/commit-msg`) to run `npx --no -- commitlint --edit "${1}"`, which validates the commit message.
        * A root-level `commitlint.config.js` will extend `@commitlint/config-conventional` to enforce standard Conventional Commits rules. Invalid commit messages will abort the commit.

### 3.4. Testing Plan

* **Tools:**
    * **Vitest:** For unit and integration tests across all packages.
    * **Playwright:** For end-to-end (E2E) or browser-specific integration tests where deemed necessary (e.g., in `@ts-json-rpc/client` usage examples).
* **Vitest Configuration:**
    * **Structure:** Each workspace will have its own `vitest.config.ts` file, extending a common base Vitest configuration.
    * **Base `vitest.config.ts` (common options):**
        * `environment: 'node'` (default test environment).
        * `coverage`: Configured to use `c8` with the `text-summary` reporter.
        * **Coverage Thresholds:** 80% for statements, branches, functions, and lines.
        * Default `exclude` patterns will be used.
    * **Workspace Overrides:** `@ts-json-rpc/client`'s `vitest.config.ts` can override `environment` to `jsdom` if browser-like DOM APIs are required for its tests.
* **Test Coverage Goal:** Aim for 80% code coverage as reported by `c8`.

### 3.5. Documentation Plan

Comprehensive documentation is paramount for an open-source project.

* **Repository-Level `README.md`:**
    * **Project Overview:** Concise description, purpose, and key benefits.
    * **Features:** List of main functionalities provided by the library.
    * **Installation:** Clear steps for installing the monorepo and its packages.
    * **Usage Examples:** Quick start guides for `@ts-json-rpc/client` and `@ts-json-rpc/server` (showing basic `call` and `handleJsonRpcRequest` usage with a mock transport).
    * **Monorepo Structure:** Explanation of the three workspaces and their responsibilities.
    * **Development Guide:** Instructions for setting up the development environment, running tests, linting, and building.
    * **Contributing:** Guidance for external contributions.
* **API Documentation:**
    * **Tool:** TypeDoc will be used to generate API reference documentation directly from source code.
    * **Inline Documentation:** All public (exported) interfaces, types, functions, classes, and their members across all packages will have comprehensive JSDoc comments.
        * Each JSDoc will include: `@description`, `@param` (name, type, optionality, purpose), `@returns` (type, description), `@throws` (explicit `JSONRPCError` instances with codes/meanings), `@example` (runnable code snippets), and `@see` (links to related entities).
        * Consistency in JSDoc style and content will be enforced.
* **Contribution Guide (`CONTRIBUTING.md`):**
    * Details on how to set up the development environment.
    * Guidelines for submitting issues and pull requests.
    * Code style and commit message (Conventional Commits) expectations.
    * Testing guidelines.
    * Code of Conduct (reference or inline).
* **LLM/AI Agent Documentation (`JsonRpcApiSchema`):**
    * **Purpose:** To provide a structured, machine-readable manifest of JSON-RPC methods for AI agents and function-calling models.
    * **Location:** A dedicated TypeScript interface/const object, likely within `@ts-json-rpc/core` or explicitly exported from `@ts-json-rpc/server`.
    * **Detail Level:** This schema will describe each RPC method with:
        * `description`: Human-readable purpose.
        * `params`: Detailed schema for parameters (e.g., using a simplified JSON Schema-like structure or clear TypeScript types).
        * `returns`: Detailed schema for return type.
        * `errors`: List of expected error codes and messages specific to the method.
        * `examples`: Concrete `request` and `response` pairs illustrating typical usage and outcomes.

### 3.6. Publishing Strategy

* **Versioning:** Synchronized versioning. All packages in the monorepo will share the same version number. A change in any package will result in a version bump for all packages.
* **Changelog Generation:** `conventional-changelog` will be utilized to automatically generate `CHANGELOG.md` files based on Conventional Commits.
* **Publishing Workflow:** Manual publishing for now. This implies developers will manually trigger the release process (e.g., via `npm version` and `npm publish` commands after review). CI/CD automation for publishing is deferred but can be added later.