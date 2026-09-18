import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsService } from './locations.service.js';
import { LocationsController } from './locations.controller.js';
import { Country } from './entities/country.entity.js';
import { Division } from './entities/division.entity.js';
import { District } from './entities/district.entity.js';
import { Upazila } from './entities/upazila.entity.js';
import { Union } from './entities/union.entity.js';
import { Area } from './entities/area.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Country, Division, District, Upazila, Union, Area])],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
