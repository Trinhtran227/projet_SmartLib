const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const FinePolicy = require('../models/FinePolicy');
const mongoose = require('mongoose');

describe('Fine Policy API Endpoints', () => {
    let adminToken;
    let userToken;
    let admin;
    let user;

    beforeAll(async () => {
        await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/library_management_test'
        );
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Promise.all([
            User.deleteMany({}),
            FinePolicy.deleteMany({})
        ]);

        const bcrypt = require('bcryptjs');

        // Regular user
        const userPassword = await bcrypt.hash('password123', 12);
        user = await User.create({
            email: 'user@example.com',
            fullName: 'Test User',
            role: 'USER',
            passwordHash: userPassword
        });

        // Admin user
        const adminPassword = await bcrypt.hash('admin123', 12);
        admin = await User.create({
            email: 'admin@example.com',
            fullName: 'Test Admin',
            role: 'ADMIN',
            passwordHash: adminPassword
        });

        // Login user
        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'user@example.com',
                password: 'password123'
            });

        userToken = userLogin.body?.data?.accessToken;

        // Login admin
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'admin@example.com',
                password: 'admin123'
            });

        adminToken = adminLogin.body?.data?.accessToken;
    });

    describe('GET /api/fine-policy', () => {
        it('should allow ADMIN to get fine policy', async () => {
            await FinePolicy.create({
                lateFeePerDay: 1000,
                damageFeeRate: 0.1,
                lostBookFeeRate: 1.0,
                currency: 'EUR',
                isActive: true
            });

            const response = await request(app)
                .get('/api/fine-policy')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.lateFeePerDay).toBe(1000);
        });

        it('should deny USER access to fine policy', async () => {
            await FinePolicy.create({
                lateFeePerDay: 1000,
                damageFeeRate: 0.1,
                lostBookFeeRate: 1.0,
                currency: 'EUR',
                isActive: true
            });

            const response = await request(app)
                .get('/api/fine-policy')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });

        it('should deny access without authentication', async () => {
            const response = await request(app)
                .get('/api/fine-policy')
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /api/fine-policy', () => {
        it('should allow ADMIN to create/update fine policy', async () => {
            const updateData = {
                lateFeePerDay: 2000,
                damageFeeRate: 0.2,
                lostBookFeeRate: 0.8,
                currency: 'EUR'
            };

            const response = await request(app)
                .put('/api/fine-policy')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.lateFeePerDay).toBe(2000);
            expect(response.body.data.damageFeeRate).toBe(0.2);
        });

        it('should create policy if none exists', async () => {
            const policyData = {
                lateFeePerDay: 1500,
                damageFeeRate: 0.15,
                lostBookFeeRate: 1.0,
                currency: 'EUR'
            };

            const response = await request(app)
                .put('/api/fine-policy')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(policyData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.lateFeePerDay).toBe(1500);
        });

        it('should prevent USER from updating policy', async () => {
            const updateData = {
                lateFeePerDay: 3000
            };

            const response = await request(app)
                .put('/api/fine-policy')
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData)
                .expect(403);

            expect(response.body.success).toBe(false);
        });

        it('should reject unauthenticated requests', async () => {
            const updateData = {
                lateFeePerDay: 3000
            };

            const response = await request(app)
                .put('/api/fine-policy')
                .send(updateData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should validate input data', async () => {
            const invalidData = {
                lateFeePerDay: -100,
                damageFeeRate: 2 // invalid (>1)
            };

            const response = await request(app)
                .put('/api/fine-policy')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });
});