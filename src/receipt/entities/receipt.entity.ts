import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('receipts')
export class Receipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  vendorName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column()
  date: Date;

  @Column()
  category: string;

  @Column({ nullable: true })
  filePath: string;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ default: false })
  isSynced: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
