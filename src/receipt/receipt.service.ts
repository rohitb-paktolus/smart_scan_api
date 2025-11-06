import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from './entities/receipt.entity';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
  ) {}

  async create(createReceiptDto: CreateReceiptDto): Promise<Receipt> {
    try {
      const receipt = this.receiptRepository.create(createReceiptDto);
      // Use the provided userId as the creator for auditing
      if ((createReceiptDto as any).userId) {
        receipt.createdById = (createReceiptDto as any).userId;
      }
      return await this.receiptRepository.save(receipt);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create receipt');
    }
  }

  async findAll(userId?: string): Promise<Receipt[]> {
    try {
      if (userId) {
        return await this.receiptRepository.find({
          where: { userId },
          order: { createdAt: 'DESC' },
        });
      }
    
      return await this.receiptRepository.find({ order: { createdAt: 'DESC' } });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch receipts');
    }
  }

  async findOne(id: string): Promise<Receipt> {
    try {
      const receipt = await this.receiptRepository.findOne({ where: { id } });
      if (!receipt) {
        throw new NotFoundException(`Receipt with ID ${id} not found`);
      }
      return receipt;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch receipt');
    }
  }

  async update(
    id: string,
    updateReceiptDto: UpdateReceiptDto,
  ): Promise<Receipt> {
    try {
      const receipt = await this.findOne(id);
      // Set updatedById if provided
      if (updateReceiptDto.updatedById) {
        receipt.updatedById = updateReceiptDto.updatedById;
      }
      const updatedReceipt = this.receiptRepository.merge(
        receipt,
        updateReceiptDto,
      );
      return await this.receiptRepository.save(updatedReceipt);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update receipt');
    }
  }

  // Soft-delete: set deletedAt and deletedById so we can track who deleted
  async remove(id: string, deletedById?: string): Promise<void> {
    try {
      const receipt = await this.findOne(id);
      receipt.deletedAt = new Date();
      if (deletedById) {
        receipt.deletedById = deletedById;
      }
      await this.receiptRepository.save(receipt);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete receipt');
    }
  }

  async findByUserId(userId: string): Promise<Receipt[]> {
    try {
      return await this.receiptRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user receipts');
    }
  }

  async markAsSynced(id: string): Promise<Receipt> {
    try {
      const receipt = await this.findOne(id);
      receipt.isSynced = true;
      return await this.receiptRepository.save(receipt);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to mark receipt as synced',
      );
    }
  }

  async findUnsynced(userId: string): Promise<Receipt[]> {
    try {
      return await this.receiptRepository.find({
        where: { userId, isSynced: false },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch unsynced receipts',
      );
    }
  }
}
