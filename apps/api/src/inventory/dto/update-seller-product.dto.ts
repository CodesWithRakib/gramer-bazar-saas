import { PartialType } from '@nestjs/swagger';
import { CreateSellerProductDto } from './create-seller-product.dto.js';

export class UpdateSellerProductDto extends PartialType(CreateSellerProductDto) {}
