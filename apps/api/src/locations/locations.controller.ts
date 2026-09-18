import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service.js';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  @ApiOperation({ summary: 'Get all active countries' })
  getCountries() {
    return this.locationsService.getCountries();
  }

  @Get('divisions')
  @ApiOperation({ summary: 'Get divisions, optionally filtered by country' })
  @ApiQuery({ name: 'countryId', required: false, type: String })
  getDivisions(@Query('countryId') countryId?: string) {
    return this.locationsService.getDivisions(countryId);
  }

  @Get('districts')
  @ApiOperation({ summary: 'Get districts, optionally filtered by division' })
  @ApiQuery({ name: 'divisionId', required: false, type: String })
  getDistricts(@Query('divisionId') divisionId?: string) {
    return this.locationsService.getDistricts(divisionId);
  }

  @Get('upazilas')
  @ApiOperation({ summary: 'Get upazilas, optionally filtered by district' })
  @ApiQuery({ name: 'districtId', required: false, type: String })
  getUpazilas(@Query('districtId') districtId?: string) {
    return this.locationsService.getUpazilas(districtId);
  }

  @Get('unions')
  @ApiOperation({ summary: 'Get unions, optionally filtered by upazila' })
  @ApiQuery({ name: 'upazilaId', required: false, type: String })
  getUnions(@Query('upazilaId') upazilaId?: string) {
    return this.locationsService.getUnions(upazilaId);
  }

  @Get('areas')
  @ApiOperation({ summary: 'Get areas/villages, optionally filtered by union' })
  @ApiQuery({ name: 'unionId', required: false, type: String })
  getAreas(@Query('unionId') unionId?: string) {
    return this.locationsService.getAreas(unionId);
  }
}
