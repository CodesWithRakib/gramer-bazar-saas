import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigService } from '@nestjs/config';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockConfigService = {
      get: (key: string) => {
        if (key === 'FRONTEND_URL') return 'https://gramer-bazar-saas.vercel.app';
        if (key === 'BACKEND_URL') return 'https://gramer-bazar-api.onrender.com';
        if (key === 'NODE_ENV') return 'test';
        return null;
      },
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should return landing page HTML or JSON metadata', () => {
      const result = appController.getRoot();
      expect(typeof result).toBe('string');
      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Gramer Bazar API');
    });

    it('should return health status', () => {
      const health = appController.getHealth();
      expect(health.status).toBe('ok');
      expect(health.service).toBe('gramer-bazar-api');
    });
  });
});
