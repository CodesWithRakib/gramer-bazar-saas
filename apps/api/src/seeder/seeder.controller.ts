import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SeederService } from './seeder.service.js';
import { ApiStandardResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { SeederResponseDto } from './dto/seeder-response.dto.js';

@ApiTags('System')
@Controller('dev/seed')
@ApiCommonErrors()
export class SeederController {
  private readonly logger = new Logger(SeederController.name);

  constructor(private readonly seederService: SeederService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed database with sample data (Development only)', description: 'Populates database with sample users, categories, products, shops, and inventory in non-production environments.' })
  @ApiStandardResponse({ type: SeederResponseDto, description: 'Seeder completed successfully' })
  async seedDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new InternalServerErrorException(
        'Seeder cannot be run in production',
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
      throw new InternalServerErrorException(
        `Seeding failed: ${error.message}`,
      );
    }
  }
}
