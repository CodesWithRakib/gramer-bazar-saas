import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service.js';
import { ProductImageService } from './product-image.service.js';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { ReorderImagesDto } from '../dto/reorder-images.dto.js';
import {
  ProductResponseDto,
  ProductImageResponseDto,
} from '../dto/product-response.dto.js';
import { MessageResponseDto } from '../../common/dto/api-response.dto.js';
import {
  ApiStandardResponse,
  ApiStandardPaginatedResponse,
  ApiStandardMessageResponse,
  ApiCommonErrors,
} from '../../common/decorators/api-standard-response.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';
import { ProductStatus } from '../enums/product-status.enum.js';

@ApiTags('Catalog - Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productImageService: ProductImageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new global product in master catalog (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Adds a master marketplace product item.',
  })
  @ApiStandardResponse({
    type: ProductResponseDto,
    status: HttpStatus.CREATED,
    description: 'Product created successfully',
  })
  @ApiCommonErrors([400, 401, 403, 409, 500])
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Search and filter global master catalog products',
    description: 'Returns paginated products filtered by category, subcategory, brand, status, or keyword.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'Potato' })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'subCategoryId', required: false, type: String })
  @ApiQuery({ name: 'brandId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ProductStatus })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'sort', required: false, type: String, example: 'newest' })
  @ApiStandardPaginatedResponse(ProductResponseDto, {
    description: 'Paginated master catalog products',
  })
  @ApiCommonErrors([500])
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('subCategoryId') subCategoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('status') status?: ProductStatus,
    @Query('isActive') isActive?: boolean,
    @Query('isFeatured') isFeatured?: boolean,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.findAll({
      page,
      limit,
      search,
      categoryId,
      subCategoryId,
      brandId,
      status,
      isActive,
      isFeatured,
      sort,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve single product by UUID',
    description: 'Returns complete product record including images, variants, brand, and category relations.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product UUID' })
  @ApiStandardResponse({
    type: ProductResponseDto,
    status: HttpStatus.OK,
    description: 'Product details',
  })
  @ApiCommonErrors([404, 500])
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update a global product (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Updates product fields in the master catalog.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product UUID' })
  @ApiStandardResponse({
    type: ProductResponseDto,
    status: HttpStatus.OK,
    description: 'Product updated successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete a global product (Admin only)',
    description: 'Requires ADMIN or SUPER_ADMIN role. Removes product from master catalog.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Product deleted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  // --- Product Images Management ---

  @Post(':id/images')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload images for product (Admin only)',
    description: 'Uploads up to 10 image files (JPEG, PNG, WebP up to 5MB each) attached to the product.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Image files to upload',
        },
      },
      required: ['files'],
    },
  })
  @ApiStandardResponse({
    type: ProductImageResponseDto,
    isArray: true,
    status: HttpStatus.CREATED,
    description: 'Uploaded product images',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    }),
  )
  uploadImages(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productImageService.uploadImages(id, files);
  }

  @Patch(':id/images/:imageId/primary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Set primary image for a product (Admin only)',
    description: 'Marks the selected image as the main catalog thumbnail.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product UUID' })
  @ApiParam({ name: 'imageId', type: String, format: 'uuid', description: 'Image UUID' })
  @ApiStandardResponse({
    type: ProductImageResponseDto,
    status: HttpStatus.OK,
    description: 'Primary image set successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  setPrimaryImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.productImageService.setPrimaryImage(id, imageId);
  }

  @Patch(':id/images/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Reorder product images sequence (Admin only)',
    description: 'Updates display ordering indices for product gallery images.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product UUID' })
  @ApiStandardResponse({
    type: ProductImageResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'Reordered images list',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  reorderImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderImagesDto,
  ) {
    return this.productImageService.reorderImages(id, dto.imageIds);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete product image (Admin only)',
    description: 'Removes image record and deletes file from storage.',
  })
  @ApiParam({ name: 'id', type: String, format: 'uuid', description: 'Product UUID' })
  @ApiParam({ name: 'imageId', type: String, format: 'uuid', description: 'Image UUID' })
  @ApiStandardMessageResponse({
    status: HttpStatus.OK,
    description: 'Product image deleted successfully',
  })
  @ApiCommonErrors([400, 401, 403, 404, 500])
  deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.productImageService.deleteImage(id, imageId);
  }
}
