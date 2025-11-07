import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ReceiptCategory } from '../enums/receipt-category.enum';

export class CreateReceiptDto {
  @IsString()
  vendorName: string;

  @IsNumber()
  totalAmount: number;

  @IsDate()
  date: Date;

  @IsEnum(ReceiptCategory)
  category: ReceiptCategory;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsString()
  // createdById is derived from `userId` so it's not accepted separately

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsBoolean()
  isSynced?: boolean;
}
