import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletsService } from './wallets.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';
import { ApiStandardResponse, ApiCommonErrors } from '../common/decorators/api-standard-response.decorator.js';
import { WalletResponseDto, WalletTransactionResponseDto } from './dto/wallet-response.dto.js';

@ApiTags('Wallets (Seller)')
@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiCommonErrors()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('my-wallet')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get current seller wallet balance', description: 'Returns available balance, pending clearance escrow, total earned, and total withdrawn for the seller.' })
  @ApiStandardResponse({ type: WalletResponseDto, description: 'Seller wallet balance retrieved successfully' })
  getMyWallet(@Request() req: any) {
    return this.walletsService.getWallet(req.user.id);
  }

  @Get('my-transactions')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get current seller wallet transactions ledger', description: 'Lists chronological transaction records (credit from orders, debit from payouts).' })
  @ApiStandardResponse({ type: WalletTransactionResponseDto, isArray: true, description: 'List of wallet ledger transactions' })
  getMyTransactions(@Request() req: any) {
    return this.walletsService.getTransactions(req.user.id);
  }
}
