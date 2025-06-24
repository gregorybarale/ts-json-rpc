# Project To-Do Checklist: `ts-json-rpc`

This checklist details the granular steps required to build the `ts-json-rpc` monorepo, following the provided blueprint. Mark items as complete as you progress.

## 📊 **PROGRESS SUMMARY**

**Overall Progress: 27/61 tasks completed (44%)**

- ✅ **Phase 1: Monorepo Setup and Core Foundation** - **14/14 tasks completed (100%)**
- ✅ **Phase 2: Client Implementation** - **13/13 tasks completed (100%)**  
- 🔄 **Phase 3: Server Implementation** - **0/16 tasks completed (0%)**
- 🔄 **Phase 4: Documentation and Tooling** - **0/18 tasks completed (0%)**

**Test Coverage: 43 unit tests passing**
- @ts-json-rpc/core: 31 tests ✅
- @ts-json-rpc/client: 12 tests ✅
- @ts-json-rpc/server: 0 tests 🔳

---

## Phase 1: Monorepo Setup and Core Foundation ✅ COMPLETED

### Chunk 1.1: Basic Monorepo Structure and Root Configuration ✅

- [x] 1.1.1: Create the root project directory `ts-json-rpc`.
- [x] 1.1.2: Initialize a new `npm` project in the root.
- [x] 1.1.3: Configure `npm workspaces` in the root `package.json`.
- [x] 1.1.4: Create the `packages/` directory.
- [x] 1.1.5: Set up the base `tsconfig.json` at the root.
- [x] 1.1.6: Set up a single, root-level `.prettierrc.js`.
- [x] 1.1.7: Set up the base `.eslintrc.js` at the root.
- [x] 1.1.8: Add `Node.js` version enforcement in root `package.json`.
- [x] 1.1.9: Add basic `build`, `test`, `lint` scripts to the root `package.json`.
- [x] 1.1.10: Install core development dependencies (`typescript`, `prettier`, `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-config-prettier`, `eslint-plugin-import`, `eslint-plugin-node`).

### Chunk 1.2: `@ts-json-rpc/core` Package Initialization and Core Types ✅

- [x] 1.2.1: Create the `packages/core` directory.
- [x] 1.2.2: Initialize `@ts-json-rpc/core` as an `npm` package within `packages/core`.
- [x] 1.2.3: Configure `package.json` for `@ts-json-rpc/core` for publishing (name, version, type, main, module, types, exports, files, scripts).
- [x] 1.2.4: Create `tsconfig.json` for `@ts-json-rpc/core`, extending the root `tsconfig.json`.
- [x] 1.2.5: Create `src/index.ts` in `@ts-json-rpc/core`.
- [x] 1.2.6: Define `JSONRPCRequest` interface.
- [x] 1.2.7: Define `JSONRPCNotification` interface.
- [x] 1.2.8: Define `JSONRPCSuccessResponse`, `JSONRPCErrorResponse`, `JSONRPCError` interfaces.
- [x] 1.2.9: Define union types for `JSONRPCResponse` (success or error), and types for batch requests/responses.
- [x] 1.2.10: Add an initial `README.md` to `@ts-json-rpc/core` with a basic description.

### Chunk 1.3: `@ts-json-rpc/core` Utility Functions (Creation & Type Guards) ✅

- [x] 1.3.1: Implement `createJsonRpcRequest` function in `@ts-json-rpc/core/src/index.ts`.
- [x] 1.3.2: Implement `createJsonRpcNotification` function in `@ts-json-rpc/core/src/index.ts`.
- [x] 1.3.3: Implement `createJsonRpcSuccessResponse` function in `@ts-json-rpc/core/src/index.ts`.
- [x] 1.3.4: Implement `createJsonRpcErrorResponse` function in `@ts-json-rpc/core/src/index.ts`.
- [x] 1.3.5: Implement `isJSONRPCRequest` type guard function.
- [x] 1.3.6: Implement `isJSONRPCNotification` type guard function.
- [x] 1.3.7: Implement `isJSONRPCSuccessResponse` type guard function.
- [x] 1.3.8: Implement `isJSONRPCErrorResponse` type guard function.
- [x] 1.3.9: Implement `isJSONRPCResponse` type guard function.
- [x] 1.3.10: Implement `createJsonRpcError` utility function (including standard error codes).
- [x] 1.3.11: Create `vitest.config.ts` for `@ts-json-rpc/core`.
- [x] 1.3.12: Create `src/__tests__/index.test.ts` in `@ts-json-rpc/core`.
- [x] 1.3.13: Write basic unit tests for creation and type guard functions in `@ts-json-rpc/core`.
- [x] 1.3.14: Add `vitest` as a dev dependency to the root `package.json`.

---

## Phase 2: Client Implementation ✅ COMPLETED

### Chunk 2.1: `@ts-json-rpc/client` Package Initialization and Transport Type ✅

- [x] 2.1.1: Create the `packages/client` directory.
- [x] 2.1.2: Initialize `@ts-json-rpc/client` as an `npm` package within `packages/client`.
- [x] 2.1.3: Configure `package.json` for `@ts-json-rpc/client` (publishing, dependencies on `@ts-json-rpc/core`).
- [x] 2.1.4: Create `tsconfig.json` for `@ts-json-rpc/client`, extending root and adding `"DOM"` to `lib`.
- [x] 2.1.5: Create `src/index.ts` in `@ts-json-rpc/client`.
- [x] 2.1.6: Define `JsonRpcClientTransport` type, importing `JSONRPCRequest` and `JSONRPCResponse` from `@ts-json-rpc/core`.
- [x] 2.1.7: Add an initial `README.md` to `@ts-json-rpc/client`.

### Chunk 2.2: `@ts-json-rpc/client` `createJsonRpcClient` Factory and `call` Method (Basic) ✅

- [x] 2.2.1: Implement `createJsonRpcClient` factory function in `@ts-json-rpc/client/src/index.ts`.
- [x] 2.2.2: Implement `call` method stub inside `createJsonRpcClient`.
- [x] 2.2.3: Implement unique request ID generation (e.g., numeric counter) for `call` method.
- [x] 2.2.4: Add logic to construct `JSONRPCRequest` using `@ts-json-rpc/core` utilities within `call`.
- [x] 2.2.5: Implement mechanism to store pending promises mapped by request ID.
- [x] 2.2.6: Add internal helper/logic to handle incoming responses and resolve/reject pending promises.
- [x] 2.2.7: Integrate `transport` function for sending requests within `call`.
- [x] 2.2.8: Create `vitest.config.ts` for `@ts-json-rpc/client`.
- [x] 2.2.9: Create `src/__tests__/index.test.ts` for `@ts-json-rpc/client`.
- [x] 2.2.10: Add basic unit tests for `createJsonRpcClient` and `call` (mocking transport) in `@ts-json-rpc/client`.

### Chunk 2.3: `@ts-json-rpc/client` `call` Method (Full Error Handling & Resolution) and `notify` ✅

- [x] 2.3.1: Refine `call` method to resolve Promise with `TResult` on success response.
- [x] 2.3.2: Implement rejection logic for `call` on `JSONRPCErrorResponse` (reject with `JSONRPCError`).
- [x] 2.3.3: Add `try...catch` for transport-level errors within `call` to reject Promise.
- [x] 2.3.4: Implement `notify` method (construct `JSONRPCNotification`, send via `transport`).
- [x] 2.3.5: Add internal logging for `notify` transport errors.
- [x] 2.3.6: Update `JsonRpcClient` interface to include `notify` (if explicitly defined).
- [x] 2.3.7: Add comprehensive unit tests for `call` (success, JSON-RPC error, transport error) and `notify` in `@ts-json-rpc/client`.

---

## Phase 3: Server Implementation

### Chunk 3.1: `@ts-json-rpc/server` Package Initialization and Method Types

- [ ] 3.1.1: Create the `packages/server` directory.
- [ ] 3.1.2: Initialize `@ts-json-rpc/server` as an `npm` package.
- [ ] 3.1.3: Configure `package.json` for `@ts-json-rpc/server` (publishing, dependencies on `@ts-json-rpc/core`).
- [ ] 3.1.4: Create `tsconfig.json` for `@ts-json-rpc/server`, extending root.
- [ ] 3.1.5: Create `src/index.ts` in `@ts-json-rpc/server`.
- [ ] 3.1.6: Define `JsonRpcMethodHandler` type.
- [ ] 3.1.7: Define `JsonRpcMethodMap` type.
- [ ] 3.1.8: Define `JsonRpcServerOptions` interface (logger, strictMethodHandling).
- [ ] 3.1.9: Add an initial `README.md` to `@ts-json-rpc/server`.

### Chunk 3.2: `@ts-json-rpc/server` `createJsonRpcServer` and Basic `handleJsonRpcRequest` (Parsing & Validation)

- [ ] 3.2.1: Implement `createJsonRpcServer` factory function in `@ts-json-rpc/server/src/index.ts`.
- [ ] 3.2.2: Define `handleJsonRpcRequest` function within `createJsonRpcServer`.
- [ ] 3.2.3: Implement `try...catch` for `rawJsonPayload` parsing, returning `Parse Error` on failure.
- [ ] 3.2.4: Implement initial validation of parsed payload (check JSON-RPC structure), returning `Invalid Request` on failure.
- [ ] 3.2.5: Utilize logger (or `console`) for internal logging during parsing/validation.
- [ ] 3.2.6: Create `vitest.config.ts` for `@ts-json-rpc/server`.
- [ ] 3.2.7: Create `src/__tests__/index.test.ts` for `@ts-json-rpc/server`.
- [ ] 3.2.8: Add unit tests for parsing and validation error scenarios in `@ts-json-rpc/server`.

### Chunk 3.3: `@ts-json-rpc/server` Single Request Handling and Method Dispatch

- [ ] 3.3.1: Add logic to differentiate single requests/notifications from batches in `handleJsonRpcRequest`.
- [ ] 3.3.2: Implement method lookup in `JsonRpcMethodMap`.
- [ ] 3.3.3: Handle `Method not found` (`-32601`) error for requests if `strictMethodHandling` is `true`.
- [ ] 3.3.4: Log and return `null` for notifications with unfound methods.
- [ ] 3.3.5: Call the method handler with `params` and `context`.
- [ ] 3.3.6: Generate `JSONRPCSuccessResponse` for successful method calls.
- [ ] 3.3.7: Catch method handler errors:
    - [ ] If `JSONRPCError`, return `JSONRPCErrorResponse`.
    - [ ] Otherwise, return `Internal error` (`-32603`).
- [ ] 3.3.8: Return `null` for all notifications.
- [ ] 3.3.9: Add unit tests for single request success, method not found (strict/non-strict), and error handling in `@ts-json-rpc/server`.

### Chunk 3.4: `@ts-json-rpc/server` Batch Request Handling

- [ ] 3.4.1: Modify `handleJsonRpcRequest` to correctly identify batch requests (array payload).
- [ ] 3.4.2: Validate that batch array is not empty, returning `Invalid Request` if so.
- [ ] 3.4.3: Iterate through each item in the batch array.
- [ ] 3.4.4: Apply single-request handling logic to each item in the batch.
- [ ] 3.4.5: Collect only non-null responses (exclude notifications) for the batch array.
- [ ] 3.4.6: Return an array of `JSONRPCResponse` objects for batch requests.
- [ ] 3.4.7: Ensure error handling within batch processing correctly generates individual `JSONRPCErrorResponse` for problematic items.
- [ ] 3.4.8: Add comprehensive unit tests for batch requests (mixed success/error/notification, empty, malformed items) in `@ts-json-rpc/server`.

---

## Phase 4: Documentation and Tooling

### Chunk 4.1: Root README and Contribution Guide

- [ ] 4.1.1: Draft `README.md` at the root (overview, features, installation, usage examples, monorepo structure, dev guide).
- [ ] 4.1.2: Draft `CONTRIBUTING.md` at the root (dev environment setup, PR/issue guidelines, code style, commit messages, testing, Code of Conduct reference).

### Chunk 4.2: TypeDoc API Documentation and JSDoc Comments

- [ ] 4.2.1: Install `typedoc` as a dev dependency.
- [ ] 4.2.2: Configure `typedoc.json` at the root to generate documentation for all packages.
- [ ] 4.2.3: Add `docs` script to root `package.json` to run TypeDoc.
- [ ] 4.2.4: Add comprehensive JSDoc comments to all public interfaces in `@ts-json-rpc/core/src/index.ts`.
- [ ] 4.2.5: Add comprehensive JSDoc comments to all public functions in `@ts-json-rpc/core/src/index.ts`.
- [ ] 4.2.6: Add comprehensive JSDoc comments to all public interfaces and functions in `@ts-json-rpc/client/src/index.ts`.
- [ ] 4.2.7: Add comprehensive JSDoc comments to all public interfaces and functions in `@ts-json-rpc/server/src/index.ts`.

### Chunk 4.3: Conventional Commits and Changelog

- [ ] 4.3.1: Install `husky`, `commitlint`, `@commitlint/config-conventional`, `conventional-changelog-cli` as dev dependencies.
- [ ] 4.3.2: Add `prepare` script to root `package.json`: `"prepare": "husky install"`.
- [ ] 4.3.3: Configure `husky` to add a `commit-msg` Git hook running `commitlint`.
- [ ] 4.3.4: Create `commitlint.config.js` at the root extending `@commitlint/config-conventional`.
- [ ] 4.3.5: Add `changelog` script to root `package.json` for `CHANGELOG.md` generation.

### Chunk 4.4: LLM/AI Agent Documentation Schema

- [ ] 4.4.1: Decide on optimal location for `JsonRpcApiSchema` (e.g., `packages/core/src/api-schema.ts`).
- [ ] 4.4.2: Define TypeScript interface for `JsonRpcApiSchema` (including `description`, `params`, `returns`, `errors`, `examples`).
- [ ] 4.4.3: Provide a small example `const` object using `JsonRpcApiSchema` to describe a hypothetical RPC method.

---