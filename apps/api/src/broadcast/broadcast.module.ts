import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BroadcastTemplate } from './entities/broadcast-template.entity.js';
import { Broadcast } from './entities/broadcast.entity.js';
import { BroadcastRecipient } from './entities/broadcast-recipient.entity.js';
import { CustomerMarketingPreference } from './entities/customer-marketing-preference.entity.js';
import { User } from '../users/entities/user.entity.js';

import { BroadcastTemplatesController } from './controllers/broadcast-templates.controller.js';
import { BroadcastAudienceController } from './controllers/broadcast-audience.controller.js';
import { BroadcastCampaignsController } from './controllers/broadcast-campaigns.controller.js';

import { BroadcastTemplatesService } from './services/broadcast-templates.service.js';
import { BroadcastAudienceService } from './services/broadcast-audience.service.js';
import { BroadcastCampaignsService } from './services/broadcast-campaigns.service.js';
import { BroadcastProcessorService } from './services/broadcast-processor.service.js';

import { BroadcastProviderRegistry } from './providers/broadcast-provider.registry.js';
import { MockBroadcastProvider } from './providers/mock/mock-broadcast.provider.js';
import { WhatsAppBroadcastProvider } from './providers/whatsapp/whatsapp-broadcast.provider.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BroadcastTemplate,
      Broadcast,
      BroadcastRecipient,
      CustomerMarketingPreference,
      User,
    ]),
  ],
  controllers: [
    BroadcastTemplatesController,
    BroadcastAudienceController,
    BroadcastCampaignsController,
  ],
  providers: [
    BroadcastTemplatesService,
    BroadcastAudienceService,
    BroadcastCampaignsService,
    BroadcastProcessorService,
    MockBroadcastProvider,
    WhatsAppBroadcastProvider,
    BroadcastProviderRegistry,
  ],
  exports: [BroadcastTemplatesService, BroadcastCampaignsService, BroadcastAudienceService],
})
export class BroadcastModule {}
