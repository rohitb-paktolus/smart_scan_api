import {
  IsString,
  IsNumber,
  IsISO8601,
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

  @IsISO8601() // This accepts ISO date strings like "2025-01-15T14:30:00.000Z"
  date: string; // Change type to string

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
