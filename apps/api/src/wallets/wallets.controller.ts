import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletsService } from './wallets.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../roles/enums/role.enum.js';

@ApiTags('Wallets (Seller)')
@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('my-wallet')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get current seller wallet balance' })
  getMyWallet(@Request() req: any) {
    return this.walletsService.getWallet(req.user.id);
  }

  @Get('my-transactions')
  @Roles(Role.SELLER)
  @ApiOperation({ summary: 'Get current seller wallet transactions ledger' })
  getMyTransactions(@Request() req: any) {
    return this.walletsService.getTransactions(req.user.id);
  }
}
