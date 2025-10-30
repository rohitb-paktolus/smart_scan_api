import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateReceiptDto {
  @IsString()
  vendorName: string;

  @IsNumber()
  totalAmount: number;

  @IsDate()
  date: Date;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsBoolean()
  isSynced?: boolean;
}
