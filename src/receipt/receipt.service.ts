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
          order: { date: 'DESC' },
        });
      }
      return await this.receiptRepository.find({ order: { date: 'DESC' } });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch receipts');
    }
  }

  async findOne(id: number): Promise<Receipt> {
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
    id: number,
    updateReceiptDto: UpdateReceiptDto,
  ): Promise<Receipt> {
    try {
      const receipt = await this.findOne(id);
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

  async remove(id: number): Promise<void> {
    try {
      const receipt = await this.findOne(id);
      await this.receiptRepository.remove(receipt);
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
        order: { date: 'DESC' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user receipts');
    }
  }

  async markAsSynced(id: number): Promise<Receipt> {
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
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch unsynced receipts',
      );
    }
  }
}
