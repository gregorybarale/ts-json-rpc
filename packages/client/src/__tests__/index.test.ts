import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJsonRpcClient, JsonRpcClientTransport } from '../index.js';
import {
    createJsonRpcSuccessResponse,
    createJsonRpcErrorResponse,
    createJsonRpcError,
    JSONRPCRequest,
    JSONRPCNotification,
    JSONRPCResponse,
} from '@ts-json-rpc/core';

describe('createJsonRpcClient', () => {
    let mockTransport: ReturnType<typeof vi.fn<Parameters<JsonRpcClientTransport>, ReturnType<JsonRpcClientTransport>>>;

    beforeEach(() => {
        mockTransport = vi.fn();
    });

    describe('call method', () => {
        it('should make a successful RPC call', async () => {
            const expectedResult = { success: true, data: 'test' };
            const successResponse = createJsonRpcSuccessResponse(1, expectedResult);
            mockTransport.mockResolvedValue(successResponse);

            const client = createJsonRpcClient(mockTransport);
            const result = await client.call('test_method', { param1: 'value1' });

            expect(result).toEqual(expectedResult);
            expect(mockTransport).toHaveBeenCalledWith({
                jsonrpc: '2.0',
                method: 'test_method',
                id: 1,
                params: { param1: 'value1' },
            });
        });

        it('should make a successful RPC call without params', async () => {
            const expectedResult = 'simple result';
            const successResponse = createJsonRpcSuccessResponse(1, expectedResult);
            mockTransport.mockResolvedValue(successResponse);

            const client = createJsonRpcClient(mockTransport);
            const result = await client.call('test_method');

            expect(result).toEqual(expectedResult);
            expect(mockTransport).toHaveBeenCalledWith({
                jsonrpc: '2.0',
                method: 'test_method',
                id: 1,
            });
        });

        it('should handle JSON-RPC error responses', async () => {
            const jsonRpcError = createJsonRpcError(-32602, 'Invalid params', { details: 'Missing field' });
            const errorResponse = createJsonRpcErrorResponse(1, jsonRpcError);
            mockTransport.mockResolvedValue(errorResponse);

            const client = createJsonRpcClient(mockTransport);

            await expect(client.call('test_method')).rejects.toThrow('Invalid params');
            
            mockTransport.mockResolvedValue(createJsonRpcErrorResponse(2, jsonRpcError));
            
            try {
                await client.call('test_method');
            } catch (error: any) {
                expect(error.code).toBe(-32602);
                expect(error.data).toEqual({ details: 'Missing field' });
            }
        });

        it('should handle transport errors', async () => {
            const transportError = new Error('Network error');
            mockTransport.mockRejectedValue(transportError);

            const client = createJsonRpcClient(mockTransport);

            await expect(client.call('test_method')).rejects.toThrow('Network error');
        });

        it('should generate unique request IDs', async () => {
            const successResponse1 = createJsonRpcSuccessResponse(1, 'result1');
            const successResponse2 = createJsonRpcSuccessResponse(2, 'result2');
            
            mockTransport
                .mockResolvedValueOnce(successResponse1)
                .mockResolvedValueOnce(successResponse2);

            const client = createJsonRpcClient(mockTransport);

            const [result1, result2] = await Promise.all([
                client.call('method1'),
                client.call('method2'),
            ]);

            expect(result1).toBe('result1');
            expect(result2).toBe('result2');
            expect(mockTransport).toHaveBeenCalledTimes(2);
            
            const call1 = mockTransport.mock.calls[0][0] as JSONRPCRequest;
            const call2 = mockTransport.mock.calls[1][0] as JSONRPCRequest;
            
            expect(call1.id).toBe(1);
            expect(call2.id).toBe(2);
        });

        it('should handle batch responses', async () => {
            const batchResponse = [
                createJsonRpcSuccessResponse(1, 'result1'),
                createJsonRpcSuccessResponse(2, 'result2'),
            ];
            
            mockTransport
                .mockResolvedValueOnce(batchResponse[0])
                .mockResolvedValueOnce(batchResponse[1]);

            const client = createJsonRpcClient(mockTransport);

            const result1 = await client.call('method1');
            const result2 = await client.call('method2');

            expect(result1).toBe('result1');
            expect(result2).toBe('result2');
        });

        it('should ignore responses for unknown request IDs', async () => {
            const unknownResponse = createJsonRpcSuccessResponse(999, 'unknown result');
            const validResponse = createJsonRpcSuccessResponse(1, 'valid result');
            
            mockTransport.mockImplementation((request) => {
                const req = request as JSONRPCRequest;
                return Promise.resolve(req.id === 1 ? validResponse : unknownResponse);
            });

            const client = createJsonRpcClient(mockTransport);
            const result = await client.call('test_method');

            expect(result).toBe('valid result');
        });
    });

    describe('notify method', () => {
        it('should send a notification with params', () => {
            mockTransport.mockResolvedValue([]);
            const client = createJsonRpcClient(mockTransport);
            
            client.notify('test_notification', { param1: 'value1' });

            expect(mockTransport).toHaveBeenCalledWith({
                jsonrpc: '2.0',
                method: 'test_notification',
                params: { param1: 'value1' },
            });
        });

        it('should send a notification without params', () => {
            mockTransport.mockResolvedValue([]);
            const client = createJsonRpcClient(mockTransport);
            
            client.notify('test_notification');

            expect(mockTransport).toHaveBeenCalledWith({
                jsonrpc: '2.0',
                method: 'test_notification',
            });
        });

        it('should handle transport errors silently', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const transportError = new Error('Network error');
            mockTransport.mockRejectedValue(transportError);

            const client = createJsonRpcClient(mockTransport);
            
            expect(() => client.notify('test_notification')).not.toThrow();
            
            return new Promise<void>((resolve) => {
                setTimeout(() => {
                    expect(consoleSpy).toHaveBeenCalledWith('JSON-RPC notification transport error:', transportError);
                    consoleSpy.mockRestore();
                    resolve();
                }, 10);
            });
        });
    });

    describe('concurrent operations', () => {
        it('should handle multiple concurrent calls correctly', async () => {
            mockTransport.mockImplementation((request) => {
                const req = request as JSONRPCRequest;
                return Promise.resolve(createJsonRpcSuccessResponse(req.id, `result_${req.id}`));
            });

            const client = createJsonRpcClient(mockTransport);

            const promises = Array.from({ length: 5 }, (_, i) => 
                client.call(`method_${i}`)
            );

            const results = await Promise.all(promises);

            expect(results).toEqual(['result_1', 'result_2', 'result_3', 'result_4', 'result_5']);
            expect(mockTransport).toHaveBeenCalledTimes(5);
        });

        it('should handle mixed calls and notifications', async () => {
            mockTransport.mockImplementation((request) => {
                const req = request as JSONRPCRequest | JSONRPCNotification;
                if ('id' in req) {
                    return Promise.resolve(createJsonRpcSuccessResponse(req.id, `call_result_${req.id}`));
                } else {
                    return Promise.resolve([]);
                }
            });

            const client = createJsonRpcClient(mockTransport);

            const callPromise = client.call('test_call');
            client.notify('test_notification');

            const callResult = await callPromise;

            expect(callResult).toBe('call_result_1');
            expect(mockTransport).toHaveBeenCalledTimes(2);
        });
    });
});