import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DispatchRunStatus, WaypointStatus } from '../enums/dispatch-run-status.enum.js';

export class CreateDispatchClusterDto {
  @ApiProperty({ example: 'Bogra Sadar - Gabtali Rural Circuit #1' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'd08c5c16-83c7-4348-8df0-eecab7ef624c' })
  @IsOptional()
  @IsUUID()
  hubId?: string;

  @ApiPropertyOptional({ example: '72bb4666-e883-431d-b873-193f443b74ad' })
  @IsOptional()
  @IsUUID()
  riderId?: string;

  @ApiProperty({ example: 'Rajshahi' })
  @IsString()
  @IsNotEmpty()
  division: string;

  @ApiProperty({ example: 'Bogra' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: 'Gabtali' })
  @IsString()
  @IsNotEmpty()
  upazila: string;

  @ApiProperty({
    type: [String],
    description: 'Array of delivery UUIDs to bundle into this cluster',
    example: ['e836bfa2-36c1-4c7b-944a-e4905cfc87f0'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('all', { each: true })
  deliveryIds: string[];

  @ApiPropertyOptional({ example: 'Sariakandi Jamuna Ghat' })
  @IsOptional()
  @IsString()
  ferryGhatName?: string;
}

export class UpdateDispatchRunStatusDto {
  @ApiProperty({ enum: DispatchRunStatus, example: DispatchRunStatus.IN_TRANSIT })
  @IsEnum(DispatchRunStatus)
  status: DispatchRunStatus;
}

export class ProgressWaypointDto {
  @ApiProperty({ enum: WaypointStatus, example: WaypointStatus.DELIVERED })
  @IsEnum(WaypointStatus)
  status: WaypointStatus;

  @ApiPropertyOptional({ example: 'Delivered to recipient at village union council premises.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class QueryClusterSuggestionDto {
  @ApiPropertyOptional({ example: 'Bogra' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ example: 'd08c5c16-83c7-4348-8df0-eecab7ef624c' })
  @IsOptional()
  @IsUUID()
  hubId?: string;
}
