import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderImagesDto {
  @ApiProperty({
    example: [
      'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      'b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e',
    ],
    description: 'Ordered list of ProductImage UUIDs representing the new display sequence',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  imageIds: string[];
}
