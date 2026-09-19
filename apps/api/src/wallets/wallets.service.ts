import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity.js';
import { WalletTransaction, TransactionType } from './entities/wallet-transaction.entity.js';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private transactionsRepository: Repository<WalletTransaction>,
    private dataSource: DataSource,
  ) {}

  async getWallet(userId: string) {
    let wallet = await this.walletsRepository.findOne({ where: { userId } });
    if (!wallet) {
      // Auto-create wallet if it doesn't exist for the user
      wallet = this.walletsRepository.create({ userId });
      wallet = await this.walletsRepository.save(wallet);
    }
    return wallet;
  }

  async getTransactions(userId: string, limit = 50) {
    const wallet = await this.getWallet(userId);
    return await this.transactionsRepository.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Called when an order is completed
  async creditEarnings(userId: string, amount: number, description: string, referenceId?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getWallet(userId);
      const parsedAmount = Number(amount);

      wallet.balance = Number(wallet.balance) + parsedAmount;
      wallet.totalEarned = Number(wallet.totalEarned) + parsedAmount;
      
      await queryRunner.manager.save(wallet);

      const tx = this.transactionsRepository.create({
        walletId: wallet.id,
        type: TransactionType.CREDIT,
        amount: parsedAmount,
        description,
        referenceId,
      });
      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();
      return wallet;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Freeze balance when a payout is requested
  async requestPayoutDebit(userId: string, amount: number) {
    const wallet = await this.getWallet(userId);
    const parsedAmount = Number(amount);

    if (Number(wallet.balance) < parsedAmount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    wallet.balance = Number(wallet.balance) - parsedAmount;
    wallet.pendingClearance = Number(wallet.pendingClearance) + parsedAmount;
    
    return await this.walletsRepository.save(wallet);
  }

  // Finalize payout (approved)
  async approvePayout(userId: string, amount: number, description: string, referenceId?: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await this.getWallet(userId);
      const parsedAmount = Number(amount);

      // Deduct from pending, add to total withdrawn
      wallet.pendingClearance = Number(wallet.pendingClearance) - parsedAmount;
      wallet.totalWithdrawn = Number(wallet.totalWithdrawn) + parsedAmount;
      
      await queryRunner.manager.save(wallet);

      const tx = this.transactionsRepository.create({
        walletId: wallet.id,
        type: TransactionType.DEBIT,
        amount: parsedAmount,
        description,
        referenceId,
      });
      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();
      return wallet;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Reject payout (refund balance)
  async rejectPayout(userId: string, amount: number) {
    const wallet = await this.getWallet(userId);
    const parsedAmount = Number(amount);

    wallet.pendingClearance = Number(wallet.pendingClearance) - parsedAmount;
    wallet.balance = Number(wallet.balance) + parsedAmount;
    
    return await this.walletsRepository.save(wallet);
  }
}
