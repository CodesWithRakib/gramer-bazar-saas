import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SeederService } from './seeder.service.js';

@Controller('dev/seed')
export class SeederController {
  private readonly logger = new Logger(SeederController.name);

  constructor(private readonly seederService: SeederService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
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
