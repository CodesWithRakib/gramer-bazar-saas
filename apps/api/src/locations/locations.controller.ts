import { Controller, Get, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LocationsService } from './locations.service.js';
import {
  CountryResponseDto,
  DivisionResponseDto,
  DistrictResponseDto,
  UpazilaResponseDto,
  UnionResponseDto,
  AreaResponseDto,
} from './dto/location-response.dto.js';
import {
  ApiStandardResponse,
  ApiCommonErrors,
} from '../common/decorators/api-standard-response.decorator.js';

@ApiTags('Locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('countries')
  @ApiOperation({
    summary: 'List all operational countries',
    description: 'Returns supported countries (e.g. Bangladesh) for localized commerce.',
  })
  @ApiStandardResponse({
    type: CountryResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of supported countries',
  })
  @ApiCommonErrors([500])
  getCountries() {
    return this.locationsService.getCountries();
  }

  @Get('divisions')
  @ApiOperation({
    summary: 'List administrative divisions',
    description: 'Retrieves all divisions, optionally filtered by countryId.',
  })
  @ApiQuery({ name: 'countryId', required: false, type: String, description: 'Optional country UUID filter' })
  @ApiStandardResponse({
    type: DivisionResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of divisions',
  })
  @ApiCommonErrors([500])
  getDivisions(@Query('countryId') countryId?: string) {
    return this.locationsService.getDivisions(countryId);
  }

  @Get('districts')
  @ApiOperation({
    summary: 'List districts by division',
    description: 'Retrieves districts, optionally filtered by divisionId.',
  })
  @ApiQuery({ name: 'divisionId', required: false, type: String, description: 'Optional division UUID filter' })
  @ApiStandardResponse({
    type: DistrictResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of districts',
  })
  @ApiCommonErrors([500])
  getDistricts(@Query('divisionId') divisionId?: string) {
    return this.locationsService.getDistricts(divisionId);
  }

  @Get('upazilas')
  @ApiOperation({
    summary: 'List upazilas by district',
    description: 'Retrieves upazilas (sub-districts), optionally filtered by districtId.',
  })
  @ApiQuery({ name: 'districtId', required: false, type: String, description: 'Optional district UUID filter' })
  @ApiStandardResponse({
    type: UpazilaResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of upazilas',
  })
  @ApiCommonErrors([500])
  getUpazilas(@Query('districtId') districtId?: string) {
    return this.locationsService.getUpazilas(districtId);
  }

  @Get('unions')
  @ApiOperation({
    summary: 'List unions by upazila',
    description: 'Retrieves union parishads, optionally filtered by upazilaId.',
  })
  @ApiQuery({ name: 'upazilaId', required: false, type: String, description: 'Optional upazila UUID filter' })
  @ApiStandardResponse({
    type: UnionResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of unions',
  })
  @ApiCommonErrors([500])
  getUnions(@Query('upazilaId') upazilaId?: string) {
    return this.locationsService.getUnions(upazilaId);
  }

  @Get('areas')
  @ApiOperation({
    summary: 'List hyperlocal delivery areas / villages',
    description: 'Retrieves local delivery areas and corresponding delivery fee schedules, optionally filtered by unionId.',
  })
  @ApiQuery({ name: 'unionId', required: false, type: String, description: 'Optional union UUID filter' })
  @ApiStandardResponse({
    type: AreaResponseDto,
    isArray: true,
    status: HttpStatus.OK,
    description: 'List of delivery areas',
  })
  @ApiCommonErrors([500])
  getAreas(@Query('unionId') unionId?: string) {
    return this.locationsService.getAreas(unionId);
  }
}
