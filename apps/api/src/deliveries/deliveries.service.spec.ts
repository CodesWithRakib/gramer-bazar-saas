import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DeliveriesService } from './deliveries.service.js';
import { Delivery } from './entities/delivery.entity.js';
import { Order } from '../orders/entities/order.entity.js';
import { User } from '../users/entities/user.entity.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { RidersService } from '../riders/riders.service.js';

describe('DeliveriesService', () => {
  let service: DeliveriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveriesService,
        { provide: getRepositoryToken(Delivery), useValue: {} },
        { provide: getRepositoryToken(Order), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: DataSource, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
        {
          provide: NotificationsService,
          useValue: {
            notifyUser: () => Promise.resolve(null),
            notifyUsers: () => Promise.resolve([]),
            notifyRole: () => Promise.resolve([]),
          },
        },
        {
          provide: RidersService,
          useValue: {
            applySystemAvailability: () => Promise.resolve(),
            recordDeliveryEarning: () => Promise.resolve(null),
            getAvailabilityMap: () => Promise.resolve({}),
          },
        },
      ],
    }).compile();

    service = module.get<DeliveriesService>(DeliveriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
