import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module.js';
import { describe, it, expect, beforeEach, afterAll, beforeAll } from 'vitest';
import { DataSource } from 'typeorm';
import { clearDatabase } from '../utils/db.js';
import { Reflector } from '@nestjs/core';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
    app.setGlobalPrefix('api/v1');

    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await clearDatabase(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/auth/send-otp (POST) - successfully sends OTP', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/send-otp')
      .send({ phone: '01711000000' })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'OTP sent successfully');
  });

  it('Full Auth Flow: Send OTP -> Verify -> Get Me -> Logout', async () => {
    const phone = '01711000001';
    
    // 1. Send OTP
    await request(app.getHttpServer())
      .post('/api/v1/auth/send-otp')
      .send({ phone })
      .expect(200);

    // Get the OTP directly from the DB
    const otpRecord = await dataSource.query(`SELECT code FROM otps WHERE phone = $1`, [phone]);
    const otp = otpRecord[0].code;

    // 2. Verify OTP
    const verifyRes = await request(app.getHttpServer())
      .post('/api/v1/auth/verify-otp')
      .send({ phone, otp })
      .expect(200);

    expect(verifyRes.body).toHaveProperty('accessToken');
    expect(verifyRes.body).toHaveProperty('refreshToken');
    const token = verifyRes.body.accessToken;

    // 3. Get Profile (ensure sensitive data is stripped)
    const profileRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(profileRes.body.phone).toBe(phone);
    expect(profileRes.body.passwordHash).toBeUndefined();
    expect(profileRes.body.refreshTokenHash).toBeUndefined();

    // 4. Logout
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('Refresh Token - rejects forged signatures', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' })
      .expect(401);

    expect(response.body.message).toBe('Invalid refresh token');
  });
});
