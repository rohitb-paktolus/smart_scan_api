
import { PartialType } from '@nestjs/mapped-types';
import { CreateReceiptDto } from './create-receipt.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ReceiptCategory } from '../enums/receipt-category.enum';

export class UpdateReceiptDto extends PartialType(CreateReceiptDto) {
  @IsOptional()
  @IsString()
  updatedById?: string;

  @IsOptional()
  @IsEnum(ReceiptCategory)
  category?: ReceiptCategory;
}