import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LocationsService } from './locations.service.js';
import { Country } from './entities/country.entity.js';
import { Division } from './entities/division.entity.js';
import { District } from './entities/district.entity.js';
import { Upazila } from './entities/upazila.entity.js';
import { Union } from './entities/union.entity.js';
import { Area } from './entities/area.entity.js';

describe('LocationsService', () => {
  let service: LocationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: getRepositoryToken(Country), useValue: {} },
        { provide: getRepositoryToken(Division), useValue: {} },
        { provide: getRepositoryToken(District), useValue: {} },
        { provide: getRepositoryToken(Upazila), useValue: {} },
        { provide: getRepositoryToken(Union), useValue: {} },
        { provide: getRepositoryToken(Area), useValue: {} },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
