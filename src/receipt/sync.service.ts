import { Injectable } from '@nestjs/common';
import { ReceiptService } from './receipt.service';

type SyncResult = {
  receiptId?: string;
  action?: 'created' | 'updated' | 'sync';
  status: 'success' | 'failed';
  message?: string;
};

// This service mimics the Flutter sync functionality
@Injectable()
export class SyncService {
  constructor(private readonly receiptService: ReceiptService) {}

  async syncLocalToCloud(userId: string): Promise<any> {
    try {
      const unsyncedReceipts = await this.receiptService.findUnsynced(userId);
  const syncResults: SyncResult[] = [];

      for (const receipt of unsyncedReceipts) {
        try {
          // Simulate API call to cloud service
          // In real implementation, you would call your cloud API here
          await this.simulateCloudUpload(receipt);

          // Mark as synced after successful upload
          await this.receiptService.markAsSynced(receipt.id);

          syncResults.push({
            receiptId: receipt.id,
            status: 'success',
            message: 'Successfully synced to cloud',
          });
        } catch (error) {
          syncResults.push({
            receiptId: receipt.id,
            status: 'failed',
            message: error.message,
          });
        }
      }

      return {
        userId,
        totalUnsynced: unsyncedReceipts.length,
        synced: syncResults.filter((r) => r.status === 'success').length,
        failed: syncResults.filter((r) => r.status === 'failed').length,
        results: syncResults,
      };
    } catch (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  async fetchCloudToLocal(userId: string): Promise<any> {
    try {
      // Simulate fetching from cloud service
      // In real implementation, you would call your cloud API here
      const cloudReceipts = await this.simulateCloudFetch(userId);

  const syncResults: SyncResult[] = [];

      for (const cloudReceipt of cloudReceipts) {
        try {
          // Check if receipt exists locally
          const existingReceipts =
            await this.receiptService.findByUserId(userId);
          const existingReceipt = existingReceipts.find(
            (r) =>
              r.vendorName === cloudReceipt.vendorName &&
              r.totalAmount === cloudReceipt.totalAmount &&
              r.date.getTime() === new Date(cloudReceipt.date).getTime(),
          );

          if (existingReceipt) {
            // Update existing receipt
            await this.receiptService.update(existingReceipt.id, {
              ...cloudReceipt,
              isSynced: true,
            });
            syncResults.push({
              receiptId: existingReceipt.id,
              action: 'updated',
              status: 'success',
            });
          } else {
            // Create new receipt
            await this.receiptService.create({
              ...cloudReceipt,
              userId,
              isSynced: true,
            });
            syncResults.push({
              action: 'created',
              status: 'success',
            });
          }
        } catch (error) {
          syncResults.push({
            action: 'sync',
            status: 'failed',
            message: error.message,
          });
        }
      }

      return {
        userId,
        totalFetched: cloudReceipts.length,
        synced: syncResults.filter((r) => r.status === 'success').length,
        failed: syncResults.filter((r) => r.status === 'failed').length,
        results: syncResults,
      };
    } catch (error) {
      throw new Error(`Cloud fetch failed: ${error.message}`);
    }
  }

  async handleNewReceipt(receiptData: any): Promise<any> {
    try {
      // Save locally first
      const localReceipt = await this.receiptService.create({
        ...receiptData,
        isSynced: false, // Mark as unsynced initially
      });

      // Try to sync to cloud immediately
      try {
        await this.simulateCloudUpload(localReceipt);
        await this.receiptService.markAsSynced(localReceipt.id);

        return {
          receipt: localReceipt,
          syncStatus: 'success',
          message: 'Receipt saved and synced successfully',
        };
      } catch (syncError) {
        // If sync fails, receipt remains with isSynced = false
        return {
          receipt: localReceipt,
          syncStatus: 'failed',
          message: 'Receipt saved locally but sync failed',
          error: syncError.message,
        };
      }
    } catch (error) {
      throw new Error(`Failed to handle new receipt: ${error.message}`);
    }
  }

  private async simulateCloudUpload(receipt: any): Promise<void> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate random failures for testing
    if (Math.random() < 0.1) {
      // 10% failure rate for testing
      throw new Error('Cloud service unavailable');
    }

    return Promise.resolve();
  }

  private async simulateCloudFetch(userId: string): Promise<any[]> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Return mock cloud data
    return [
      {
        vendorName: 'Cloud Store',
        totalAmount: 25.5,
        date: new Date(),
        category: 'Shopping',
        filePath: '/cloud/receipts/receipt_cloud_1.jpg',
        tags: 'cloud, sync, test',
      },
    ];
  }
}
