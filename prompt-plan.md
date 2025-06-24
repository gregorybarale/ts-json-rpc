## Project Blueprint: `ts-json-rpc`

This blueprint outlines the development process for the `ts-json-rpc` monorepo, focusing on incremental progress, best practices, and a modular approach.

### Phase 1: Monorepo Setup and Core Foundation

**Chunk 1.1: Basic Monorepo Structure and Root Configuration**

* **Goal:** Establish the fundamental monorepo layout, root `package.json`, and initial shared configuration for TypeScript, ESLint, and Prettier.
* **Detailed Steps:**
    1.  Create the root project directory `ts-json-rpc`.
    2.  Initialize a new `npm` project in the root.
    3.  Configure `npm workspaces` in the root `package.json`.
    4.  Create the `packages/` directory.
    5.  Set up the base `tsconfig.json` at the root.
    6.  Set up a single, root-level `.prettierrc.js`.
    7.  Set up the base `.eslintrc.js` at the root.
    8.  Add `Node.js` version enforcement in root `package.json`.
    9.  Add basic `build`, `test`, `lint` scripts to the root `package.json`.
    10. Install core development dependencies (`typescript`, `prettier`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-prettier`, `eslint-plugin-import`, `eslint-plugin-node`).

**Chunk 1.2: `@ts-json-rpc/core` Package Initialization and Core Types**

* **Goal:** Create the `@ts-json-rpc/core` package, define its `package.json`, `tsconfig.json`, and implement the fundamental JSON-RPC 2.0 message types.
* **Detailed Steps:**
    1.  Create the `packages/core` directory.
    2.  Initialize `@ts-json-rpc/core` as an `npm` package within `packages/core`.
    3.  Configure `package.json` for `@ts-json-rpc/core` for publishing (name, version, type, main, module, types, exports, files, scripts).
    4.  Create `tsconfig.json` for `@ts-json-rpc/core`, extending the root `tsconfig.json`.
    5.  Create `src/index.ts` in `@ts-json-rpc/core`.
    6.  Define `JSONRPCRequest`, `JSONRPCNotification` interfaces.
    7.  Define `JSONRPCSuccessResponse`, `JSONRPCErrorResponse`, `JSONRPCError` interfaces.
    8.  Define union types for `JSONRPCResponse` (success or error), and types for batch requests/responses.
    9.  Add an initial `README.md` to `@ts-json-rpc/core` with a basic description.

**Chunk 1.3: `@ts-json-rpc/core` Utility Functions (Creation & Type Guards)**

* **Goal:** Implement utility functions for creating JSON-RPC messages and robust type guards to validate them.
* **Detailed Steps:**
    1.  In `@ts-json-rpc/core/src/index.ts` (or a new `utils.ts`):
    2.  Implement functions for programmatically constructing `JSONRPCRequest`, `JSONRPCNotification`, `JSONRPCSuccessResponse`, and `JSONRPCErrorResponse` objects.
    3.  Implement `isJSONRPCRequest`, `isJSONRPCNotification`, `isJSONRPCSuccessResponse`, `isJSONRPCErrorResponse` type guard functions.
    4.  Implement a general `isJSONRPCResponse` type guard.
    5.  Implement `createJsonRpcError` utility function for standard and custom errors.
    6.  Add basic unit tests for creation and type guard functions using Vitest.
    7.  Configure Vitest for `@ts-json-rpc/core`.
    8.  Add `vitest` as a dev dependency to the root `package.json`.

### Phase 2: Client Implementation

**Chunk 2.1: `@ts-json-rpc/client` Package Initialization and Transport Type**

* **Goal:** Set up the `@ts-json-rpc/client` package and define the `JsonRpcClientTransport` type.
* **Detailed Steps:**
    1.  Create the `packages/client` directory.
    2.  Initialize `@ts-json-rpc/client` as an `npm` package within `packages/client`.
    3.  Configure `package.json` for `@ts-json-rpc/client` (same structure as core, adding `@ts-json-rpc/core` as a dependency).
    4.  Create `tsconfig.json` for `@ts-json-rpc/client`, extending root and adding `"DOM"` to `lib`.
    5.  Create `src/index.ts` in `@ts-json-rpc/client`.
    6.  Define `JsonRpcClientTransport` type, importing `JSONRPCRequest` and `JSONRPCResponse` from `@ts-json-rpc/core`.
    7.  Add an initial `README.md` to `@ts-json-rpc/client`.

**Chunk 2.2: `@ts-json-rpc/client` `createJsonRpcClient` Factory and `call` Method (Basic)**

* **Goal:** Implement the `createJsonRpcClient` factory and the basic `call` method functionality, including request ID generation and managing pending requests.
* **Detailed Steps:**
    1.  Implement `createJsonRpcClient` factory function in `@ts-json-rpc/client/src/index.ts`.
    2.  Inside `createJsonRpcClient`, implement the `call` method stub.
    3.  Implement unique request ID generation (e.g., using a counter or `crypto.randomUUID`).
    4.  Add logic to construct `JSONRPCRequest` using the utility from `@ts-json-rpc/core`.
    5.  Implement a basic mechanism to store pending promises, mapped by request ID.
    6.  Add an internal helper to handle incoming responses (matching ID to pending promise).
    7.  Integrate the `transport` function for sending requests.
    8.  Add unit tests for `createJsonRpcClient` and the basic `call` functionality (without full transport mock).
    9.  Configure Vitest for `@ts-json-rpc/client`.

**Chunk 2.3: `@ts-json-rpc/client` `call` Method (Full Error Handling & Resolution) and `notify`**

* **Goal:** Complete the `call` method with proper error handling and resolution, and implement the `notify` method.
* **Detailed Steps:**
    1.  Refine the `call` method to resolve the Promise with `TResult` on success.
    2.  Implement rejection logic for `call` if `JSONRPCErrorResponse` is received, creating a `JSONRPCError` object.
    3.  Handle potential transport-level errors by rejecting the Promise.
    4.  Implement the `notify` method, constructing `JSONRPCNotification` and sending via transport.
    5.  Add internal logging for `notify` transport errors.
    6.  Add comprehensive unit tests covering success, error responses, transport errors for `call`, and `notify` functionality.

### Phase 3: Server Implementation

**Chunk 3.1: `@ts-json-rpc/server` Package Initialization and Method Types**

* **Goal:** Set up the `@ts-json-rpc/server` package and define `JsonRpcMethodHandler`, `JsonRpcMethodMap`, and `JsonRpcServerOptions` types.
* **Detailed Steps:**
    1.  Create the `packages/server` directory.
    2.  Initialize `@ts-json-rpc/server` as an `npm` package.
    3.  Configure `package.json` for `@ts-json-rpc/server` (dependencies on `@ts-json-rpc/core`).
    4.  Create `tsconfig.json` for `@ts-json-rpc/server`, extending root.
    5.  Create `src/index.ts` in `@ts-json-rpc/server`.
    6.  Define `JsonRpcMethodHandler`, `JsonRpcMethodMap`, and `JsonRpcServerOptions` types.
    7.  Add an initial `README.md` to `@ts-json-rpc/server`.

**Chunk 3.2: `@ts-json-rpc/server` `createJsonRpcServer` and Basic `handleJsonRpcRequest` (Parsing & Validation)**

* **Goal:** Implement the `createJsonRpcServer` factory and the initial parsing and validation logic for `handleJsonRpcRequest`.
* **Detailed Steps:**
    1.  Implement `createJsonRpcServer` factory function in `@ts-json-rpc/server/src/index.ts`.
    2.  Inside `createJsonRpcServer`, define the `handleJsonRpcRequest` function.
    3.  Implement parsing of the raw JSON payload, handling `ParseError` (`-32700`).
    4.  Implement initial validation of the parsed payload against JSON-RPC message structures, handling `InvalidRequest` (`-32600`).
    5.  Add basic logging using the provided `logger` (or `console` default).
    6.  Add unit tests for parsing and validation error scenarios.
    7.  Configure Vitest for `@ts-json-rpc/server`.

**Chunk 3.3: `@ts-json-rpc/server` Single Request Handling and Method Dispatch**

* **Goal:** Implement the logic for handling a single JSON-RPC request (non-batch), including method dispatch and success/error response generation.
* **Detailed Steps:**
    1.  Within `handleJsonRpcRequest`, add logic to identify single requests.
    2.  Implement method lookup in `JsonRpcMethodMap`.
    3.  Handle `Method not found` (`-32601`) error if `strictMethodHandling` is `true`.
    4.  If the method is not found for a `JSONRPCNotification`, log the event using the logger but return `null` (no response).
    5.  Call the method handler with `params` and `context`.
    6.  Generate `JSONRPCSuccessResponse` for successful method calls.
    7.  Catch errors thrown by method handlers and wrap them in `JSONRPCErrorResponse` (including `Internal error` and propagating `JSONRPCError` instances).
    8.  Return `null` for notifications.
    9.  Add unit tests for single request success, method not found (strict/non-strict), and various error handling scenarios.

**Chunk 3.4: `@ts-json-rpc/server` Batch Request Handling**

* **Goal:** Implement comprehensive support for batch JSON-RPC requests, processing each request and collecting responses.
* **Detailed Steps:**
    1.  Within `handleJsonRpcRequest`, add logic to identify batch requests.
    2.  Validate that batch requests are not empty, returning `InvalidRequest` if so.
    3.  Iterate through each item in the batch.
    4.  Process each item in the batch using the existing single-request logic.
    5.  Collect only non-null responses (i.e., exclude notifications).
    6.  Return an array of `JSONRPCResponse` objects for batch responses.
    7.  Ensure error handling within the batch processing correctly generates individual `JSONRPCErrorResponse` for problematic items in the batch.
    8.  Add unit tests for batch requests, including mixed success/error/notification, empty batch, and malformed items in a batch.

### Phase 4: Documentation and Tooling

**Chunk 4.1: Root README and Contribution Guide**

* **Goal:** Create comprehensive repository-level `README.md` and `CONTRIBUTING.md` files.
* **Detailed Steps:**
    1.  Draft the `README.md` at the root, covering project overview, features, installation, usage examples (with mock transports for client/server), monorepo structure, and development guide.
    2.  Draft the `CONTRIBUTING.md` guide, including development environment setup, PR/issue guidelines, code style, commit message expectations, and testing.

**Chunk 4.2: TypeDoc API Documentation and JSDoc Comments**

* **Goal:** Integrate TypeDoc and add comprehensive JSDoc comments to all public APIs.
* **Detailed Steps:**
    1.  Install `typedoc` as a dev dependency.
    2.  Configure TypeDoc in a `typedoc.json` file at the root to generate documentation for all three packages.
    3.  Add `docs` script to root `package.json` to run TypeDoc.
    4.  Review all public interfaces, types, and functions in `@ts-json-rpc/core`, `@ts-json-rpc/client`, and `@ts-json-rpc/server`.
    5.  Add detailed JSDoc comments to all public members, including `@description`, `@param` (with type, name, purpose), `@returns` (type, description), and `@example` where applicable.

**Chunk 4.3: Conventional Commits and Changelog**

* **Goal:** Enforce Conventional Commits and configure automatic `CHANGELOG.md` generation.
* **Detailed Steps:**
    1.  Install `husky`, `commitlint`, `@commitlint/config-conventional`, `conventional-changelog-cli` as dev dependencies.
    2.  Configure `husky` to install hooks via `prepare` script.
    3.  Set up the `commit-msg` Git hook to run `commitlint`.
    4.  Create `commitlint.config.js` file at the root that extends `@commitlint/config-conventional`.
    5.  Add a `changelog` script to the root `package.json` that uses `conventional-changelog-cli` to generate `CHANGELOG.md` (e.g., `conventional-changelog -p angular -i CHANGELOG.md -s -r 0`).

**Chunk 4.4: LLM/AI Agent Documentation Schema**

* **Goal:** Define the `JsonRpcApiSchema` for AI agent documentation within `@ts-json-rpc/core` or `@ts-json-rpc/server`.
* **Detailed Steps:**
    1.  Decide on the best location for `JsonRpcApiSchema` (likely `core` or `server`).
    2.  Define the TypeScript interface/const object for `JsonRpcApiSchema` including `description`, `params` (simplified JSON Schema-like), `returns`, `errors`, and `examples`.
    3.  Add examples of how this schema would be used for a hypothetical RPC method.

---

### LLM Code Generation Prompts

Here are the prompts for each granular step, designed to be incremental and build upon previous outputs.

---

### Phase 1: Monorepo Setup and Core Foundation

#### Prompt for Step 1.1.1-1.1.4: Initial Monorepo Setup

````text
Please create the initial file structure for a TypeScript monorepo named `ts-json-rpc`.
This should include:
1. A root directory `ts-json-rpc`.
2. A `package.json` file in the root, configured for `npm workspaces`.
3. An empty `packages/` directory inside the root.

Do not include any other files or content at this stage.