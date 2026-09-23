import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service.js';
import { SettingsController } from './settings.controller.js';
import { PlatformSetting } from './entities/platform-setting.entity.js';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PlatformSetting])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
