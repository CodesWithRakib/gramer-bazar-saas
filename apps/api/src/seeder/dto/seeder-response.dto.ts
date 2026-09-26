import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SeederResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Database seeded successfully' })
  message: string;

  @ApiPropertyOptional({ example: { users: 10, products: 25, categories: 8 } })
  details?: Record<string, any>;
}
