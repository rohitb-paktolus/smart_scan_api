import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptService } from './receipt.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { Receipt } from './entities/receipt.entity';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync } from 'fs';

@Controller('receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/receipts',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `receipt-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
          return callback(
            new BadRequestException('Only image and PDF files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async create(
    @Body() createReceiptDto: CreateReceiptDto,
  @UploadedFile() file?: any,
  ): Promise<Receipt> {
    if (file) {
      createReceiptDto.filePath = file.path;
    }
    return this.receiptService.create(createReceiptDto);
  }

  @Get()
  async findAll(@Query('userId') userId?: string): Promise<Receipt[]> {
    return this.receiptService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Receipt> {
    return this.receiptService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
  ): Promise<Receipt> {
    // updatedById should be provided in the body
    return this.receiptService.update(id, updateReceiptDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Query('deletedById') deletedById?: string,
  ): Promise<void> {
    return this.receiptService.remove(id, deletedById);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Receipt[]> {
    return this.receiptService.findByUserId(userId);
  }

  @Post(':id/sync')
  async markAsSynced(@Param('id') id: string): Promise<Receipt> {
    return this.receiptService.markAsSynced(id);
  }

  @Get('user/:userId/unsynced')
  async findUnsynced(@Param('userId') userId: string): Promise<Receipt[]> {
    return this.receiptService.findUnsynced(userId);
  }

  @Get(':id/file')
  async downloadFile(@Param('id') id: string, @Res() res) {
    const receipt = await this.receiptService.findOne(id);
    if (!receipt.filePath) {
      throw new NotFoundException('No file associated with this receipt');
    }

    const filePath = join(process.cwd(), receipt.filePath);
    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    // Let Express handle content-type and streaming
    return res.sendFile(filePath);
  }
}
