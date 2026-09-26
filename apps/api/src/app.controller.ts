import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiProduces } from '@nestjs/swagger';
import { ApiStandardResponse } from './common/decorators/api-standard-response.decorator.js';
import { AppRootResponseDto, HealthResponseDto } from './app-response.dto.js';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System root landing page or JSON metadata', description: 'Returns interactive HTML landing dashboard for browsers or JSON metadata when Accept: application/json.' })
  @ApiProduces('text/html', 'application/json')
  @ApiResponse({ status: 200, type: AppRootResponseDto, description: 'API service summary or landing page' })
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
  @ApiOperation({ summary: 'Hello ping check', description: 'Simple text string greeting for quick uptime verification.' })
  @ApiResponse({ status: 200, type: String, description: 'Hello greeting' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('docs')
  @ApiOperation({ summary: 'Redirect to Swagger OpenAPI documentation' })
  @ApiResponse({ status: 302, description: 'Redirects to /api/docs' })
  redirectToDocs(@Res() res: Response) {
    return res.redirect('/api/docs');
  }

  @Get('health')
  @ApiOperation({ summary: 'Liveness and health check probe', description: 'Standard health check endpoint reporting uptime, service identifier, and environment.' })
  @ApiResponse({ status: 200, type: HealthResponseDto, description: 'System health probe status' })
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
