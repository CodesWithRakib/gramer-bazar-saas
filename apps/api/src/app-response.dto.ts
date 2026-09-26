import { ApiProperty } from '@nestjs/swagger';

export class AppRootResponseDto {
  @ApiProperty({ example: 'Gramer Bazar API' })
  name: string;

  @ApiProperty({ example: 'gramer-bazar-api' })
  service: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ example: 'Hyperlocal Multi-Vendor Agri-Marketplace & Enterprise SaaS Backend Engine' })
  description: string;

  @ApiProperty({ example: 'online' })
  status: string;

  @ApiProperty({ example: 3600.5 })
  uptime: number;

  @ApiProperty({ example: '/api/docs' })
  documentation: string;

  @ApiProperty({ example: '/health' })
  healthCheck: string;

  @ApiProperty({ example: '/api/v1' })
  apiV1: string;

  @ApiProperty({ example: 'https://gramer-bazar-saas.vercel.app' })
  frontendUrl: string;
}

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: 'gramer-bazar-api' })
  service: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 3600.5 })
  uptime: number;

  @ApiProperty({ example: 'production' })
  environment: string;

  @ApiProperty({ example: '/api/docs' })
  docs: string;
}
