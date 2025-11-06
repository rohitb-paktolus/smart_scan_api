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
