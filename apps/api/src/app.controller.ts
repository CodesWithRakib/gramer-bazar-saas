import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  getRoot(
    @Req() req?: Request,
    @Res({ passthrough: true }) res?: Response,
  ): string | Record<string, unknown> {
    const acceptHeader = req?.headers?.accept || '';

    // If client specifically requests JSON (e.g. automated CLI or curl without Accept: text/html)
    if (acceptHeader.includes('application/json') && !acceptHeader.includes('text/html')) {
      return {
        name: 'Gramer Bazar API',
        service: 'gramer-bazar-api',
        version: '1.0.0',
        description: 'Hyperlocal Multi-Vendor Agri-Marketplace & Enterprise SaaS Backend Engine',
        status: 'online',
        uptime: process.uptime(),
        documentation: '/api/docs',
        healthCheck: '/health',
        apiV1: '/api/v1',
        frontendUrl:
          this.configService.get<string>('FRONTEND_URL') ||
          'https://gramer-bazar-saas.vercel.app',
      };
    }

    if (res) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    return this.appService.getLandingPageHtml();
  }

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('docs')
  redirectToDocs(@Res() res: Response) {
    return res.redirect('/api/docs');
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'gramer-bazar-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>('NODE_ENV') || 'production',
      docs: '/api/docs',
    };
  }
}
