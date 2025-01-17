import { Server } from '@hapi/hapi';
import userLoginPlugin from '../plugins/users/login';

describe('getUserId Tests', () => {
	let server: Server;

	beforeEach(async () => {
		server = new Server();
		await server.register(userLoginPlugin);

		// Mock Redis methods
		server.method('redisQuery', jest.fn());
		// Mock Database methods 
		server.method('databaseQuery', jest.fn());
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('userName lookups', () => {
		test('should return ID from Redis cache when available', async () => {
			const mockRedisResponse = {
				code: 200,
				data: "123"
			};
			
			(server.methods.redisQuery as jest.Mock).mockResolvedValue(mockRedisResponse);

			const result = await server.methods.getUserId('userName', 'testUser');
			
			expect(result).toBe("123");
			expect(server.methods.redisQuery).toHaveBeenCalledWith('GET user_name_testUser');
			expect(server.methods.databaseQuery).not.toHaveBeenCalled();
		});

		test('should query database when Redis cache misses', async () => {
			const mockRedisResponse = {
				code: 200,
				data: null
			};
			const mockDbResponse = [[{ id: 456 }]];
			
			(server.methods.redisQuery as jest.Mock).mockResolvedValue(mockRedisResponse);
			(server.methods.databaseQuery as jest.Mock).mockResolvedValue(mockDbResponse);

			const result = await server.methods.getUserId('userName', 'testUser');
			
			expect(result).toBe(456);
			expect(server.methods.databaseQuery).toHaveBeenCalledWith(
				expect.stringContaining('SELECT id FORM users WHERE user_name = testUser')
			);
		});
	});

	describe('userMail lookups', () => {
		test('should return ID from Redis cache when available', async () => {
			const mockRedisResponse = {
				code: 200,
				data: "789"
			};
			
			(server.methods.redisQuery as jest.Mock).mockResolvedValue(mockRedisResponse);

			const result = await server.methods.getUserId('userMail', 'test@example.com');
			
			expect(result).toBe("789");
			expect(server.methods.redisQuery).toHaveBeenCalledWith('GET user_mail_test@example.com');
			expect(server.methods.databaseQuery).not.toHaveBeenCalled();
		});

		test('should query database when Redis cache misses', async () => {
			const mockRedisResponse = {
				code: 200,
				data: null
			};
			const mockDbResponse = [[{ id: 101 }]];
			
			(server.methods.redisQuery as jest.Mock).mockResolvedValue(mockRedisResponse);
			(server.methods.databaseQuery as jest.Mock).mockResolvedValue(mockDbResponse);

			const result = await server.methods.getUserId('userMail', 'test@example.com');
			
			expect(result).toBe(101);
			expect(server.methods.databaseQuery).toHaveBeenCalledWith(
				expect.stringContaining('SELECT id FORM users WHERE user_mail = test@example.com')
			);
		});
	});

	test('should handle invalid type parameter', async () => {
		const result = await server.methods.getUserId('invalidType', 'testUser');
		expect(result).toBeUndefined();
	});

	test('should handle database errors gracefully', async () => {
		const mockRedisResponse = {
			code: 200,
			data: null
		};
		
		(server.methods.redisQuery as jest.Mock).mockResolvedValue(mockRedisResponse);
		(server.methods.databaseQuery as jest.Mock).mockRejectedValue(new Error('Database error'));

		await expect(server.methods.getUserId('userName', 'testUser'))
			.rejects
			.toThrow('Database error');
	});
});