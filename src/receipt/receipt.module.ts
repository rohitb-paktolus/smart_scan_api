import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptService } from './receipt.service';
import { ReceiptController } from './receipt.controller';
import { SyncService } from './sync.service';
import { Receipt } from './entities/receipt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receipt])],
  controllers: [ReceiptController],
  providers: [ReceiptService, SyncService],
  exports: [ReceiptService, SyncService],
})
export class ReceiptModule {}
