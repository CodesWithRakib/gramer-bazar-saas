import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RiderAvailability } from '../enums/rider-availability.enum.js';
import { RiderEarningStatus } from '../enums/rider-earning-status.enum.js';
import { DeliveryResponseDto } from '../../deliveries/dto/delivery-response.dto.js';

export class RiderProfileResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  userId: string;

  @ApiProperty({ example: 'Karim Mia' })
  fullName: string;

  @ApiProperty({ example: '01712345678' })
  phone: string;

  @ApiPropertyOptional({ example: 'rider@example.com', nullable: true })
  email?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.gramerbazar.com/avatar.png', nullable: true })
  avatar?: string | null;

  @ApiPropertyOptional({ example: '19901234567890123', nullable: true })
  nidNumber?: string | null;

  @ApiPropertyOptional({ example: 'Station Road, Debiganj', nullable: true })
  address?: string | null;

  @ApiPropertyOptional({ example: 'Debiganj Sadar', nullable: true })
  preferredZone?: string | null;

  @ApiPropertyOptional({ example: '01798001122 (Brother)', nullable: true })
  emergencyContact?: string | null;

  @ApiProperty({ example: 'BIKE' })
  vehicleType: string;

  @ApiPropertyOptional({ example: 'DHK-METRO-HA-5542', nullable: true })
  vehiclePlateNumber?: string | null;

  @ApiPropertyOptional({ example: 'DL-RNG-2020-0098', nullable: true })
  drivingLicenseNumber?: string | null;

  @ApiProperty({ enum: RiderAvailability, example: RiderAvailability.OFFLINE })
  availability: RiderAvailability;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiPropertyOptional({ example: '2026-09-26T10:00:00.000Z', nullable: true })
  lastAvailableAt?: string | null;

  @ApiProperty({ example: '2026-09-20T08:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  updatedAt: string;
}

export class RiderEarningResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e' })
  deliveryId: string;

  @ApiProperty({ example: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f' })
  orderId: string;

  @ApiProperty({ example: 'GBZ20260926A1B2' })
  orderNumber: string;

  @ApiProperty({ example: 60, description: 'Earning amount in BDT' })
  amount: number;

  @ApiProperty({ enum: RiderEarningStatus, example: RiderEarningStatus.EARNED })
  status: RiderEarningStatus;

  @ApiPropertyOptional({ example: '2026-09-26T11:00:00.000Z', nullable: true })
  deliveredAt?: string | null;

  @ApiProperty({ example: '2026-09-26T10:00:00.000Z' })
  createdAt: string;
}

export class RiderEarningsSummaryDto {
  @ApiProperty({ example: 180, description: 'Earnings credited today' })
  todayEarnings: number;

  @ApiProperty({ example: 600, description: 'Earnings in the last 7 days' })
  weekEarnings: number;

  @ApiProperty({ example: 2400, description: 'Earnings in the last 30 days' })
  monthEarnings: number;

  @ApiProperty({ example: 12480, description: 'Lifetime credited earnings' })
  totalEarned: number;

  @ApiProperty({ example: 300, description: 'Amount locked in pending payout requests' })
  pendingPayout: number;

  @ApiProperty({ example: 9600, description: 'Total paid out so far' })
  paidOut: number;

  @ApiProperty({ example: 2580, description: 'Balance available to withdraw' })
  availableBalance: number;

  @ApiProperty({ example: 42, description: 'Lifetime completed deliveries' })
  totalDeliveries: number;
}

export class RiderEarningsResponseDto {
  @ApiProperty({ type: RiderEarningsSummaryDto })
  summary: RiderEarningsSummaryDto;

  @ApiProperty({ type: [RiderEarningResponseDto] })
  data: RiderEarningResponseDto[];

  @ApiProperty({
    example: { total: 42, page: 1, limit: 10, totalPages: 5 },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class RiderDashboardMetricsDto {
  @ApiProperty({ example: 3 })
  todayDeliveries: number;

  @ApiProperty({ example: 2 })
  pendingAssignments: number;

  @ApiProperty({ example: 1 })
  activeDeliveries: number;

  @ApiProperty({ example: 5 })
  todayCompleted: number;

  @ApiProperty({ example: 42 })
  totalCompleted: number;
}

export class RiderDashboardResponseDto {
  @ApiProperty({ enum: RiderAvailability, example: RiderAvailability.AVAILABLE })
  availability: RiderAvailability;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty({ type: RiderDashboardMetricsDto })
  metrics: RiderDashboardMetricsDto;

  @ApiProperty({ type: RiderEarningsSummaryDto })
  earnings: RiderEarningsSummaryDto;

  @ApiPropertyOptional({ type: () => DeliveryResponseDto, nullable: true })
  activeDelivery: DeliveryResponseDto | null;

  @ApiProperty({ type: [DeliveryResponseDto] })
  newAssignments: DeliveryResponseDto[];

  @ApiProperty({ type: [DeliveryResponseDto] })
  recentDeliveries: DeliveryResponseDto[];
}
