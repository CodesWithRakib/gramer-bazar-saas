import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  Headers,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { SeederService } from './seeder.service.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import { SeederResponseDto } from './dto/seeder-response.dto.js';

@ApiTags('System')
@Controller('dev/seed')
@ApiCommonErrors()
export class SeederController {
  private readonly logger = new Logger(SeederController.name);

  constructor(private readonly seederService: SeederService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Seed database with sample data',
    description:
      'Populates database with full sample users, categories, products, shops, inventory, orders, reviews, and broadcasts.',
  })
  @ApiHeader({
    name: 'x-seed-secret',
    required: false,
    description:
      'Secret token to authorize seeding in production (optional if ALLOW_PRODUCTION_SEED=true is set in Render).',
  })
  @ApiStandardResponse({ type: SeederResponseDto, description: 'Seeder completed successfully' })
  async seedDatabase(@Headers('x-seed-secret') seedSecretHeader?: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowProdSeed =
      process.env.ALLOW_PRODUCTION_SEED === 'true' ||
      Boolean(process.env.SEED_SECRET && seedSecretHeader === process.env.SEED_SECRET);

    if (isProduction && !allowProdSeed) {
      throw new ForbiddenException(
        'Database seeder is disabled in production. Set ALLOW_PRODUCTION_SEED=true in environment variables or pass valid x-seed-secret header.',
      );
    }

    try {
      this.logger.log('Starting full database seed process...');
      const result = await this.seederService.seed();
      this.logger.log('Database seeding completed successfully');
      return {
        success: true,
        message: 'Database seeded successfully',
        details: result,
      };
    } catch (error: any) {
      this.logger.error('Failed to seed database', error);
      throw new InternalServerErrorException(`Seeding failed: ${error.message}`);
    }
  }
}
