import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BroadcastProviderName } from '../enums/broadcast.enums.js';
import type { BroadcastProvider } from './broadcast-provider.interface.js';
import { MockBroadcastProvider } from './mock/mock-broadcast.provider.js';
import { WhatsAppBroadcastProvider } from './whatsapp/whatsapp-broadcast.provider.js';

/**
 * Resolves the active broadcast provider from configuration.
 *
 * This is the single switch that swaps the whole system between the development
 * mock provider and a real provider:
 *
 *   BROADCAST_PROVIDER=mock      → MockBroadcastProvider (default)
 *   BROADCAST_PROVIDER=whatsapp  → WhatsAppBroadcastProvider (not implemented yet)
 *
 * No other module should ever instantiate a provider directly.
 */
@Injectable()
export class BroadcastProviderRegistry {
  constructor(
    private readonly configService: ConfigService,
    private readonly mockProvider: MockBroadcastProvider,
    private readonly whatsappProvider: WhatsAppBroadcastProvider,
  ) {}

  private normalize(value: string | undefined): BroadcastProviderName {
    const normalized = (value ?? '').trim().toLowerCase();
    if (normalized === 'whatsapp') return BroadcastProviderName.WHATSAPP;
    return BroadcastProviderName.MOCK;
  }

  /** Provider name configured for the platform. */
  getActiveName(): BroadcastProviderName {
    return this.normalize(this.configService.get<string>('broadcast.provider'));
  }

  /** The provider used for actual sends. */
  getActive(): BroadcastProvider {
    return this.get(this.getActiveName());
  }

  get(name: BroadcastProviderName): BroadcastProvider {
    return name === BroadcastProviderName.WHATSAPP ? this.whatsappProvider : this.mockProvider;
  }

  /** True when the configured provider simulates delivery. */
  isSimulated(): boolean {
    return this.getActive().simulated;
  }
}
