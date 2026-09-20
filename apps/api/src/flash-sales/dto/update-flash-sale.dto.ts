import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashSaleDto } from './create-flash-sale.dto.js';

export class UpdateFlashSaleDto extends PartialType(CreateFlashSaleDto) {}
