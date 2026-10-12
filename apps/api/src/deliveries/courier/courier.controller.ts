import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { CourierService } from './courier.service.js';
import { BookCourierDto } from './dto/book-courier.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';

@ApiTags('Courier')
@Controller('courier')
@ApiCommonErrors()
export class CourierController {
  private readonly logger = new Logger(CourierController.name);

  constructor(private readonly courierService: CourierService) {}

  @Post('admin/book')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Admin: Book 3PL parcel shipment (Steadfast or Pathao)',
    description:
      'Creates a 3PL parcel shipment with Steadfast or Pathao, records tracking code and marks delivery as OUT_FOR_DELIVERY.',
  })
  @HttpCode(HttpStatus.OK)
  async bookParcel(@Body() dto: BookCourierDto) {
    return this.courierService.bookCourierForOrder(dto.orderId, dto.provider, dto.note);
  }

  @Get('track/:trackingCode')
  @ApiOperation({
    summary: 'Public / Customer: Track parcel by tracking code',
    description: 'Retrieves live status information from the courier gateway.',
  })
  @ApiParam({ name: 'trackingCode', example: 'STDF123456' })
  async trackParcel(@Param('trackingCode') trackingCode: string) {
    return this.courierService.trackParcel(trackingCode);
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Public: Courier status webhook receiver',
    description: 'Receives delivery status callbacks from Steadfast or Pathao.',
  })
  @ApiParam({ name: 'provider', example: 'steadfast' })
  async handleWebhook(@Param('provider') provider: string, @Body() body: Record<string, unknown>) {
    this.logger.log(`Received courier webhook from ${provider}: ${JSON.stringify(body)}`);
    return this.courierService.handleCourierWebhook(provider, body);
  }
}
