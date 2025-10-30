import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('local-to-cloud/:userId')
  async syncLocalToCloud(@Param('userId') userId: string) {
    return this.syncService.syncLocalToCloud(userId);
  }

  @Post('cloud-to-local/:userId')
  async fetchCloudToLocal(@Param('userId') userId: string) {
    return this.syncService.fetchCloudToLocal(userId);
  }

  @Post('handle-receipt')
  async handleNewReceipt(@Body() receiptData: any) {
    return this.syncService.handleNewReceipt(receiptData);
  }
}
