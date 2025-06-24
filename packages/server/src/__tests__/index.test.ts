import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJsonRpcServer, JsonRpcMethodMap, JsonRpcServerOptions } from '../index.js';
import {
    createJsonRpcRequest,
    createJsonRpcNotification,
    createJsonRpcError,
    JSONRPCRequest,
    JSONRPCNotification,
    JSONRPCErrorResponse,
    JSONRPCSuccessResponse,
    JSONRPC_ERROR_CODES,
} from '@ts-json-rpc/core';

describe('createJsonRpcServer', () => {
    let mockLogger: {
        info: ReturnType<typeof vi.fn>;
        warn: ReturnType<typeof vi.fn>;
        error: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        mockLogger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
        };
    });

    describe('parsing and validation', () => {
        it('should handle valid JSON string payload', async () => {
            const methods: JsonRpcMethodMap = {
                test: () => 'success',
            };

            const server = createJsonRpcServer(methods);
            const request = createJsonRpcRequest('test', 1);
            const result = await server.handleJsonRpcRequest(JSON.stringify(request));

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                result: 'success',
            });
        });

        it('should handle valid object payload', async () => {
            const methods: JsonRpcMethodMap = {
                test: () => 'success',
            };

            const server = createJsonRpcServer(methods);
            const request = createJsonRpcRequest('test', 1);
            const result = await server.handleJsonRpcRequest(request);

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                result: 'success',
            });
        });

        it('should return parse error for invalid JSON string', async () => {
            const methods: JsonRpcMethodMap = {};
            const server = createJsonRpcServer(methods, { logger: mockLogger });

            const result = await server.handleJsonRpcRequest('invalid json{');

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: JSONRPC_ERROR_CODES.PARSE_ERROR,
                    message: 'Parse error',
                },
            });
            expect(mockLogger.error).toHaveBeenCalledWith('JSON-RPC parse error:', expect.any(Error));
        });

        it('should return invalid request error for malformed JSON-RPC', async () => {
            const methods: JsonRpcMethodMap = {};
            const server = createJsonRpcServer(methods, { logger: mockLogger });

            const result = await server.handleJsonRpcRequest({ invalid: 'structure' });

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: JSONRPC_ERROR_CODES.INVALID_REQUEST,
                    message: 'Invalid Request',
                },
            });
            expect(mockLogger.warn).toHaveBeenCalledWith('JSON-RPC invalid request structure:', { invalid: 'structure' });
        });

        it('should return invalid request error for empty batch', async () => {
            const methods: JsonRpcMethodMap = {};
            const server = createJsonRpcServer(methods, { logger: mockLogger });

            const result = await server.handleJsonRpcRequest([]);

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: JSONRPC_ERROR_CODES.INVALID_REQUEST,
                    message: 'Invalid Request',
                },
            });
            expect(mockLogger.warn).toHaveBeenCalledWith('JSON-RPC empty batch request');
        });
    });

    describe('single request handling', () => {
        it('should execute method and return success response', async () => {
            const methods: JsonRpcMethodMap = {
                add: (params: { a: number; b: number }) => params.a + params.b,
            };

            const server = createJsonRpcServer(methods);
            const request = createJsonRpcRequest('add', 1, { a: 5, b: 3 });
            const result = await server.handleJsonRpcRequest(request);

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                result: 8,
            });
        });

        it('should execute async method and return success response', async () => {
            const methods: JsonRpcMethodMap = {
                asyncAdd: async (params: { a: number; b: number }) => {
                    return Promise.resolve(params.a + params.b);
                },
            };

            const server = createJsonRpcServer(methods);
            const request = createJsonRpcRequest('asyncAdd', 1, { a: 10, b: 20 });
            const result = await server.handleJsonRpcRequest(request);

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                result: 30,
            });
        });

        it('should handle method with context', async () => {
            const methods: JsonRpcMethodMap<{ userId: string }> = {
                greet: (params: { name: string }, context: { userId: string }) => {
                    return `Hello ${params.name}, user ${context.userId}`;
                },
            };

            const server = createJsonRpcServer(methods);
            const request = createJsonRpcRequest('greet', 1, { name: 'Alice' });
            const result = await server.handleJsonRpcRequest(request, { userId: '123' });

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                result: 'Hello Alice, user 123',
            });
        });

        it('should return method not found error in strict mode', async () => {
            const methods: JsonRpcMethodMap = {};
            const server = createJsonRpcServer(methods, { logger: mockLogger, strictMethodHandling: true });

            const request = createJsonRpcRequest('unknown', 1);
            const result = await server.handleJsonRpcRequest(request);

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                error: {
                    code: JSONRPC_ERROR_CODES.METHOD_NOT_FOUND,
                    message: 'Method not found',
                },
            });
            expect(mockLogger.warn).toHaveBeenCalledWith('JSON-RPC method not found: unknown');
        });

        it('should return null for unknown method in non-strict mode', async () => {
            const methods: JsonRpcMethodMap = {};
            const server = createJsonRpcServer(methods, { logger: mockLogger, strictMethodHandling: false });

            const request = createJsonRpcRequest('unknown', 1);
            const result = await server.handleJsonRpcRequest(request);

            expect(result).toBeNull();
            expect(mockLogger.info).toHaveBeenCalledWith('JSON-RPC method not found (non-strict mode): unknown');
        });

        it('should handle custom JSON-RPC errors from method handlers', async () => {
            const customError = createJsonRpcError(-32001, 'Custom error', { details: 'Something went wrong' });
            const methods: JsonRpcMethodMap = {
                errorMethod: () => {
                    throw customError;
                },
            };

            const server = createJsonRpcServer(methods, { logger: mockLogger });
            const request = createJsonRpcRequest('errorMethod', 1);
            const result = await server.handleJsonRpcRequest(request);

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                error: customError,
            });
            expect(mockLogger.warn).toHaveBeenCalledWith('JSON-RPC method error in errorMethod:', customError);
        });

        it('should handle internal errors from method handlers', async () => {
            const methods: JsonRpcMethodMap = {
                errorMethod: () => {
                    throw new Error('Unexpected error');
                },
            };

            const server = createJsonRpcServer(methods, { logger: mockLogger });
            const request = createJsonRpcRequest('errorMethod', 1);
            const result = await server.handleJsonRpcRequest(request);

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                error: {
                    code: JSONRPC_ERROR_CODES.INTERNAL_ERROR,
                    message: 'Internal error',
                },
            });
            expect(mockLogger.error).toHaveBeenCalledWith('JSON-RPC internal error in errorMethod:', expect.any(Error));
        });
    });

    describe('notification handling', () => {
        it('should execute notification and return null', async () => {
            const mockMethod = vi.fn().mockReturnValue('success');
            const methods: JsonRpcMethodMap = {
                notify: mockMethod,
            };

            const server = createJsonRpcServer(methods);
            const notification = createJsonRpcNotification('notify', { data: 'test' });
            const result = await server.handleJsonRpcRequest(notification);

            expect(result).toBeNull();
            expect(mockMethod).toHaveBeenCalledWith({ data: 'test' }, undefined);
        });

        it('should log unknown notification method and return null', async () => {
            const methods: JsonRpcMethodMap = {};
            const server = createJsonRpcServer(methods, { logger: mockLogger });

            const notification = createJsonRpcNotification('unknown');
            const result = await server.handleJsonRpcRequest(notification);

            expect(result).toBeNull();
            expect(mockLogger.info).toHaveBeenCalledWith('JSON-RPC notification for unknown method: unknown');
        });

        it('should handle notification method errors silently', async () => {
            const methods: JsonRpcMethodMap = {
                errorNotification: () => {
                    throw new Error('Notification error');
                },
            };

            const server = createJsonRpcServer(methods, { logger: mockLogger });
            const notification = createJsonRpcNotification('errorNotification');
            const result = await server.handleJsonRpcRequest(notification);

            expect(result).toBeNull();
            expect(mockLogger.error).toHaveBeenCalledWith('JSON-RPC notification method error in errorNotification:', expect.any(Error));
        });
    });

    describe('batch request handling', () => {
        it('should handle mixed batch with requests and notifications', async () => {
            const methods: JsonRpcMethodMap = {
                add: (params: { a: number; b: number }) => params.a + params.b,
                log: () => 'logged',
            };

            const server = createJsonRpcServer(methods);
            const batch = [
                createJsonRpcRequest('add', 1, { a: 1, b: 2 }),
                createJsonRpcNotification('log', { message: 'test' }),
                createJsonRpcRequest('add', 2, { a: 3, b: 4 }),
            ];

            const result = await server.handleJsonRpcRequest(batch);

            expect(result).toEqual([
                {
                    jsonrpc: '2.0',
                    id: 1,
                    result: 3,
                },
                {
                    jsonrpc: '2.0',
                    id: 2,
                    result: 7,
                },
            ]);
        });

        it('should return null for batch with only notifications', async () => {
            const methods: JsonRpcMethodMap = {
                log: () => 'logged',
            };

            const server = createJsonRpcServer(methods);
            const batch = [
                createJsonRpcNotification('log', { message: 'test1' }),
                createJsonRpcNotification('log', { message: 'test2' }),
            ];

            const result = await server.handleJsonRpcRequest(batch);

            expect(result).toBeNull();
        });

        it('should handle batch with errors', async () => {
            const methods: JsonRpcMethodMap = {
                success: () => 'ok',
                error: () => {
                    throw createJsonRpcError(-32001, 'Custom error');
                },
            };

            const server = createJsonRpcServer(methods);
            const batch = [
                createJsonRpcRequest('success', 1),
                createJsonRpcRequest('error', 2),
                createJsonRpcRequest('unknown', 3),
            ];

            const result = await server.handleJsonRpcRequest(batch);

            expect(result).toEqual([
                {
                    jsonrpc: '2.0',
                    id: 1,
                    result: 'ok',
                },
                {
                    jsonrpc: '2.0',
                    id: 2,
                    error: {
                        code: -32001,
                        message: 'Custom error',
                    },
                },
                {
                    jsonrpc: '2.0',
                    id: 3,
                    error: {
                        code: JSONRPC_ERROR_CODES.METHOD_NOT_FOUND,
                        message: 'Method not found',
                    },
                },
            ]);
        });
    });

    describe('server options', () => {
        it('should use default console logger when none provided', async () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            
            const methods: JsonRpcMethodMap = {};
            const server = createJsonRpcServer(methods);

            await server.handleJsonRpcRequest(createJsonRpcRequest('unknown', 1));

            expect(consoleSpy).toHaveBeenCalledWith('JSON-RPC method not found: unknown');
            consoleSpy.mockRestore();
        });

        it('should default to strict method handling', async () => {
            const methods: JsonRpcMethodMap = {};
            const server = createJsonRpcServer(methods, { logger: mockLogger });

            const result = await server.handleJsonRpcRequest(createJsonRpcRequest('unknown', 1));

            expect(result).toEqual({
                jsonrpc: '2.0',
                id: 1,
                error: {
                    code: JSONRPC_ERROR_CODES.METHOD_NOT_FOUND,
                    message: 'Method not found',
                },
            });
        });
    });
});