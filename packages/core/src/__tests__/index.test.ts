import { describe, it, expect } from 'vitest';
import {
    createJsonRpcRequest,
    createJsonRpcNotification,
    createJsonRpcSuccessResponse,
    createJsonRpcErrorResponse,
    createJsonRpcError,
    createStandardJsonRpcError,
    isJSONRPCRequest,
    isJSONRPCNotification,
    isJSONRPCSuccessResponse,
    isJSONRPCErrorResponse,
    isJSONRPCResponse,
    isJSONRPCError,
    JSONRPC_ERROR_CODES,
    JSONRPC_ERROR_MESSAGES,
} from '../index.js';

describe('JSON-RPC Creation Functions', () => {
    describe('createJsonRpcRequest', () => {
        it('should create a valid JSON-RPC request with params', () => {
            const request = createJsonRpcRequest('test_method', 1, { param1: 'value1' });
            
            expect(request).toEqual({
                jsonrpc: '2.0',
                method: 'test_method',
                id: 1,
                params: { param1: 'value1' },
            });
        });

        it('should create a valid JSON-RPC request without params', () => {
            const request = createJsonRpcRequest('test_method', 'test-id');
            
            expect(request).toEqual({
                jsonrpc: '2.0',
                method: 'test_method',
                id: 'test-id',
            });
        });
    });

    describe('createJsonRpcNotification', () => {
        it('should create a valid JSON-RPC notification with params', () => {
            const notification = createJsonRpcNotification('test_method', { param1: 'value1' });
            
            expect(notification).toEqual({
                jsonrpc: '2.0',
                method: 'test_method',
                params: { param1: 'value1' },
            });
        });

        it('should create a valid JSON-RPC notification without params', () => {
            const notification = createJsonRpcNotification('test_method');
            
            expect(notification).toEqual({
                jsonrpc: '2.0',
                method: 'test_method',
            });
        });
    });

    describe('createJsonRpcSuccessResponse', () => {
        it('should create a valid JSON-RPC success response', () => {
            const response = createJsonRpcSuccessResponse(1, { result: 'success' });
            
            expect(response).toEqual({
                jsonrpc: '2.0',
                id: 1,
                result: { result: 'success' },
            });
        });
    });

    describe('createJsonRpcErrorResponse', () => {
        it('should create a valid JSON-RPC error response', () => {
            const error = createJsonRpcError(-32602, 'Invalid params');
            const response = createJsonRpcErrorResponse(1, error);
            
            expect(response).toEqual({
                jsonrpc: '2.0',
                id: 1,
                error: {
                    code: -32602,
                    message: 'Invalid params',
                },
            });
        });

        it('should create a valid JSON-RPC error response with null id', () => {
            const error = createJsonRpcError(-32700, 'Parse error');
            const response = createJsonRpcErrorResponse(null, error);
            
            expect(response).toEqual({
                jsonrpc: '2.0',
                id: null,
                error: {
                    code: -32700,
                    message: 'Parse error',
                },
            });
        });
    });

    describe('createJsonRpcError', () => {
        it('should create a valid JSON-RPC error with data', () => {
            const error = createJsonRpcError(-32602, 'Invalid params', { details: 'Missing required field' });
            
            expect(error).toEqual({
                code: -32602,
                message: 'Invalid params',
                data: { details: 'Missing required field' },
            });
        });

        it('should create a valid JSON-RPC error without data', () => {
            const error = createJsonRpcError(-32601, 'Method not found');
            
            expect(error).toEqual({
                code: -32601,
                message: 'Method not found',
            });
        });
    });

    describe('createStandardJsonRpcError', () => {
        it('should create standard error codes correctly', () => {
            const parseError = createStandardJsonRpcError('PARSE_ERROR');
            expect(parseError).toEqual({
                code: -32700,
                message: 'Parse error',
            });

            const invalidRequest = createStandardJsonRpcError('INVALID_REQUEST', { reason: 'malformed' });
            expect(invalidRequest).toEqual({
                code: -32600,
                message: 'Invalid Request',
                data: { reason: 'malformed' },
            });
        });
    });
});

describe('JSON-RPC Type Guards', () => {
    describe('isJSONRPCRequest', () => {
        it('should return true for valid JSON-RPC request', () => {
            const request = {
                jsonrpc: '2.0',
                method: 'test_method',
                id: 1,
                params: { test: true },
            };
            
            expect(isJSONRPCRequest(request)).toBe(true);
        });

        it('should return false for JSON-RPC notification', () => {
            const notification = {
                jsonrpc: '2.0',
                method: 'test_method',
                params: { test: true },
            };
            
            expect(isJSONRPCRequest(notification)).toBe(false);
        });

        it('should return false for invalid objects', () => {
            expect(isJSONRPCRequest({})).toBe(false);
            expect(isJSONRPCRequest(null)).toBe(false);
            expect(isJSONRPCRequest('string')).toBe(false);
            expect(isJSONRPCRequest({ jsonrpc: '1.0', method: 'test', id: 1 })).toBe(false);
            expect(isJSONRPCRequest({ jsonrpc: '2.0', id: 1 })).toBe(false);
            expect(isJSONRPCRequest({ jsonrpc: '2.0', method: 'test' })).toBe(false);
        });
    });

    describe('isJSONRPCNotification', () => {
        it('should return true for valid JSON-RPC notification', () => {
            const notification = {
                jsonrpc: '2.0',
                method: 'test_method',
                params: { test: true },
            };
            
            expect(isJSONRPCNotification(notification)).toBe(true);
        });

        it('should return false for JSON-RPC request', () => {
            const request = {
                jsonrpc: '2.0',
                method: 'test_method',
                id: 1,
                params: { test: true },
            };
            
            expect(isJSONRPCNotification(request)).toBe(false);
        });

        it('should return false for invalid objects', () => {
            expect(isJSONRPCNotification({})).toBe(false);
            expect(isJSONRPCNotification(null)).toBe(false);
            expect(isJSONRPCNotification({ jsonrpc: '2.0', id: 1 })).toBe(false);
        });
    });

    describe('isJSONRPCSuccessResponse', () => {
        it('should return true for valid JSON-RPC success response', () => {
            const response = {
                jsonrpc: '2.0',
                id: 1,
                result: { success: true },
            };
            
            expect(isJSONRPCSuccessResponse(response)).toBe(true);
        });

        it('should return false for JSON-RPC error response', () => {
            const response = {
                jsonrpc: '2.0',
                id: 1,
                error: { code: -32602, message: 'Invalid params' },
            };
            
            expect(isJSONRPCSuccessResponse(response)).toBe(false);
        });

        it('should return false for invalid objects', () => {
            expect(isJSONRPCSuccessResponse({})).toBe(false);
            expect(isJSONRPCSuccessResponse({ jsonrpc: '2.0', result: true })).toBe(false);
        });
    });

    describe('isJSONRPCErrorResponse', () => {
        it('should return true for valid JSON-RPC error response', () => {
            const response = {
                jsonrpc: '2.0',
                id: 1,
                error: { code: -32602, message: 'Invalid params' },
            };
            
            expect(isJSONRPCErrorResponse(response)).toBe(true);
        });

        it('should return true for error response with null id', () => {
            const response = {
                jsonrpc: '2.0',
                id: null,
                error: { code: -32700, message: 'Parse error' },
            };
            
            expect(isJSONRPCErrorResponse(response)).toBe(true);
        });

        it('should return false for JSON-RPC success response', () => {
            const response = {
                jsonrpc: '2.0',
                id: 1,
                result: { success: true },
            };
            
            expect(isJSONRPCErrorResponse(response)).toBe(false);
        });

        it('should return false for invalid objects', () => {
            expect(isJSONRPCErrorResponse({})).toBe(false);
            expect(isJSONRPCErrorResponse({ jsonrpc: '2.0', error: true })).toBe(false);
            expect(isJSONRPCErrorResponse({ jsonrpc: '2.0', id: 1, error: {} })).toBe(false);
        });
    });

    describe('isJSONRPCResponse', () => {
        it('should return true for success response', () => {
            const response = {
                jsonrpc: '2.0',
                id: 1,
                result: { success: true },
            };
            
            expect(isJSONRPCResponse(response)).toBe(true);
        });

        it('should return true for error response', () => {
            const response = {
                jsonrpc: '2.0',
                id: 1,
                error: { code: -32602, message: 'Invalid params' },
            };
            
            expect(isJSONRPCResponse(response)).toBe(true);
        });

        it('should return false for request or notification', () => {
            const request = {
                jsonrpc: '2.0',
                method: 'test_method',
                id: 1,
            };
            
            expect(isJSONRPCResponse(request)).toBe(false);
        });
    });

    describe('isJSONRPCError', () => {
        it('should return true for valid JSON-RPC error', () => {
            const error = {
                code: -32602,
                message: 'Invalid params',
                data: { details: 'test' },
            };
            
            expect(isJSONRPCError(error)).toBe(true);
        });

        it('should return true for error without data', () => {
            const error = {
                code: -32601,
                message: 'Method not found',
            };
            
            expect(isJSONRPCError(error)).toBe(true);
        });

        it('should return false for invalid objects', () => {
            expect(isJSONRPCError({})).toBe(false);
            expect(isJSONRPCError({ code: -32602 })).toBe(false);
            expect(isJSONRPCError({ message: 'test' })).toBe(false);
        });
    });
});

describe('Constants', () => {
    it('should have correct error codes', () => {
        expect(JSONRPC_ERROR_CODES.PARSE_ERROR).toBe(-32700);
        expect(JSONRPC_ERROR_CODES.INVALID_REQUEST).toBe(-32600);
        expect(JSONRPC_ERROR_CODES.METHOD_NOT_FOUND).toBe(-32601);
        expect(JSONRPC_ERROR_CODES.INVALID_PARAMS).toBe(-32602);
        expect(JSONRPC_ERROR_CODES.INTERNAL_ERROR).toBe(-32603);
    });

    it('should have correct error messages', () => {
        expect(JSONRPC_ERROR_MESSAGES[-32700]).toBe('Parse error');
        expect(JSONRPC_ERROR_MESSAGES[-32600]).toBe('Invalid Request');
        expect(JSONRPC_ERROR_MESSAGES[-32601]).toBe('Method not found');
        expect(JSONRPC_ERROR_MESSAGES[-32602]).toBe('Invalid params');
        expect(JSONRPC_ERROR_MESSAGES[-32603]).toBe('Internal error');
    });
});