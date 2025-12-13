const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Mock the pg module
jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  const mPool = {
    connect: jest.fn((cb) => {
      if (cb) cb(null, mClient, jest.fn());
      return Promise.resolve(mClient);
    }),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mPool) };
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Backend API Tests', () => {
  let app;
  let mockPool;

  beforeAll(() => {
    // Create a minimal express app for testing
    app = express();
    app.use(cors());
    app.use(express.json());

    const { Pool } = require('pg');
    mockPool = new Pool();

    // Define routes
    app.get('/api/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date() });
    });

    app.get('/api/users', async (req, res) => {
      try {
        const result = await mockPool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.json(result.rows);
      } catch {
        res.status(500).json({ error: 'Database error' });
      }
    });

    app.post('/api/users', async (req, res) => {
      const { name, email } = req.body;
      try {
        const result = await mockPool.query(
          'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
          [name, email]
        );
        res.status(201).json(result.rows[0]);
      } catch {
        res.status(500).json({ error: 'Database error' });
      }
    });

    app.delete('/api/users/:id', async (req, res) => {
      const { id } = req.params;
      try {
        await mockPool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted' });
      } catch {
        res.status(500).json({ error: 'Database error' });
      }
    });
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/users', () => {
    it('should return list of users', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2025-12-13T17:21:41.537Z' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2025-12-13T17:21:41.537Z' }
      ];

      mockPool.query.mockResolvedValueOnce({ rows: mockUsers });

      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY created_at DESC');
    });

    it('should handle database errors', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).get('/api/users');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = { name: 'Test User', email: 'test@example.com' };
      const createdUser = { id: 1, ...newUser, created_at: '2025-12-13T17:21:41.551Z' };

      mockPool.query.mockResolvedValueOnce({ rows: [createdUser] });

      const response = await request(app)
        .post('/api/users')
        .send(newUser);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdUser);
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [newUser.name, newUser.email]
      );
    });

    it('should handle database errors on creation', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test', email: 'test@example.com' });
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      mockPool.query.mockResolvedValueOnce({});

      const response = await request(app).delete('/api/users/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted');
      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', ['1']);
    });

    it('should handle database errors on deletion', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).delete('/api/users/1');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Database error');
    });
  });
});
