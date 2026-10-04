import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { ReviewResponseDto, ModerateReviewDto } from './dto/review-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Retrieve approved reviews for a product',
    description:
      'Public endpoint. Returns paginated customer ratings and feedback for the product.',
  })
  @ApiParam({ name: 'productId', type: String, format: 'uuid', description: 'Product UUID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiStandardPaginatedResponse(ReviewResponseDto, {
    description: 'Paginated product reviews list',
  })
  @ApiCommonErrors([500])
  getProductReviews(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.reviewsService.getProductReviews(
      productId,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Submit a product review (Customer only)',
    description:
      'Requires CUSTOMER role. Submits verified purchase rating score (1-5), optional feedback comment, and product photos.',
  })
  @ApiStandardResponse({
    type: ReviewResponseDto,
    status: HttpStatus.CREATED,
    description: 'Review submitted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  addReview(@Request() req: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.addReview(
      req.user.id,
      dto.productId,
      dto.rating,
      dto.comment,
      dto.images,
    );
  }

  @Get('user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List own submitted reviews (Customer only)',
    description: 'Returns all reviews submitted by the authenticated customer account.',
  })
  @ApiStandardResponse({
    type: ReviewResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Customer review history',
  })
  @ApiCommonErrors([401, 500])
  getUserReviews(@Request() req: any) {
    return this.reviewsService.getUserReviews(req.user.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('reviews.read')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List all reviews for moderation (Admin only)',
    description:
      'Requires ADMIN or SUPER_ADMIN role. Returns paginated reviews queue with approval flags.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiStandardPaginatedResponse(ReviewResponseDto, {
    description: 'Paginated moderation queue',
  })
  @ApiCommonErrors([401, 403, 500])
  getAdminReviews(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.reviewsService.getAdminReviews(page, limit, search);
  }

  @Patch('admin/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Permissions('reviews.moderate')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Moderate review approval status (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Toggles review visibility on storefront.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Review UUID' })
  @ApiStandardResponse({
    type: ReviewResponseDto,
    status: HttpStatus.OK,
    description: 'Review moderation updated',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  moderateReview(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ModerateReviewDto) {
    return this.reviewsService.moderateReview(id, dto.isApproved);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update your review (Customer only)',
    description: 'Requires CUSTOMER role. Updates an existing review submitted by you.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Review UUID' })
  @ApiStandardResponse({
    type: ReviewResponseDto,
    status: HttpStatus.OK,
    description: 'Review updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  updateReview(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(
      req.user.id,
      id,
      dto.rating,
      dto.comment,
      dto.images,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CUSTOMER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete your review (Customer only)',
    description: 'Requires CUSTOMER role. Deletes a review you submitted.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Review UUID' })
  @ApiStandardResponse({
    status: HttpStatus.OK,
    description: 'Review deleted successfully',
  })
  @ApiCommonErrors([401, 403, 404, 500])
  deleteReview(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.deleteReview(req.user.id, id);
  }
}
