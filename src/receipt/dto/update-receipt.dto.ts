
import { PartialType } from '@nestjs/mapped-types';
import { CreateReceiptDto } from './create-receipt.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateReceiptDto extends PartialType(CreateReceiptDto) {
	@IsOptional()
	@IsString()
	updatedById?: string;
}
