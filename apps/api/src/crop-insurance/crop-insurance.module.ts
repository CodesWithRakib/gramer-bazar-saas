import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CropInsurancePolicy } from './entities/crop-insurance-policy.entity.js';
import { FarmerInsuranceEnrollment } from './entities/farmer-insurance-enrollment.entity.js';
import { ParametricClaimDisbursement } from './entities/parametric-claim-disbursement.entity.js';
import { WeatherTriggerTelemetry } from './entities/weather-trigger-telemetry.entity.js';
import { User } from '../users/entities/user.entity.js';
import { CropInsuranceService } from './crop-insurance.service.js';
import { CropInsuranceController } from './crop-insurance.controller.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CropInsurancePolicy,
      FarmerInsuranceEnrollment,
      ParametricClaimDisbursement,
      WeatherTriggerTelemetry,
      User,
    ]),
  ],
  controllers: [CropInsuranceController],
  providers: [CropInsuranceService],
  exports: [CropInsuranceService],
})
export class CropInsuranceModule {}
