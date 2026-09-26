import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WishlistsService } from './wishlists.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { ApiStandardResponse, ApiStandardMessageResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { WishlistItemResponseDto } from './dto/wishlist-response.dto.js';

@ApiTags('Wishlists')
@Controller('wishlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist', description: 'Returns all products currently saved in the authenticated user wishlist.' })
  @ApiStandardResponse({ type: WishlistItemResponseDto, isArray: true, description: 'User wishlist items retrieved successfully' })
  getUserWishlist(@Request() req: any) {
    return this.wishlistsService.getUserWishlist(req.user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: 'Add product to wishlist', description: 'Adds the specified product to user saved wishlist.' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiStandardMessageResponse({ status: 201, description: 'Product added to wishlist successfully' })
  addProductToWishlist(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistsService.addProductToWishlist(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist', description: 'Removes the specified product from user saved wishlist.' })
  @ApiParam({ name: 'productId', description: 'Product UUID' })
  @ApiStandardMessageResponse({ description: 'Product removed from wishlist successfully' })
  removeProductFromWishlist(@Request() req: any, @Param('productId') productId: string) {
    return this.wishlistsService.removeProductFromWishlist(req.user.id, productId);
  }
}
