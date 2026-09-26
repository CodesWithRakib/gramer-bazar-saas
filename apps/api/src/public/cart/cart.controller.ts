import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service.js';
import { ValidateCartDto, CartValidationResultDto } from './dto/validate-cart.dto.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';

@ApiTags('Public Cart')
@Controller('public/cart')
export class PublicCartController {
  constructor(private readonly cartService: CartService) {}

  @Post('validate')
  @ApiOperation({
    summary: 'Validate cart items against live seller price and stock',
    description: 'Checks stock availability and real-time prices for items before checkout.',
  })
  @ApiStandardResponse({
    type: CartValidationResultDto,
    status: HttpStatus.OK,
    description: 'Validation results and recalculated total',
  })
  @ApiCommonErrors([400, 500])
  validateCart(@Body() dto: ValidateCartDto) {
    return this.cartService.validateCart(dto.items);
  }
}
