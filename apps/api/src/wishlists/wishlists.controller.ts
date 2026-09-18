import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistsService } from './wishlists.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('Wishlists')
@Controller('wishlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  getUserWishlist(@Request() req: any) {
    return this.wishlistsService.getUserWishlist(req.user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist' })
  addProductToWishlist(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistsService.addProductToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  removeProductFromWishlist(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistsService.removeProductFromWishlist(req.user.id, productId);
  }
}
