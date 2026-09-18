import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CartService, CartValidateItem } from './cart.service.js';

@ApiTags('Public / Cart')
@Controller('public/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate cart items against current price and stock' })
  validateCart(@Body('items') items: CartValidateItem[]) {
    return this.cartService.validateCart(items);
  }
}
