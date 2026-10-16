import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogisticsDispatchService } from './logistics-dispatch.service.js';
import { DispatchRunStatus, WaypointStatus } from '../enums/dispatch-run-status.enum.js';
import { DeliveryStatus } from '../enums/delivery-status.enum.js';
import { OrderStatus } from '../../orders/enums/order-status.enum.js';

describe('LogisticsDispatchService', () => {
  let service: LogisticsDispatchService;
  let mockClusterRepo: any;
  let mockDeliveryRepo: any;
  let mockHubRepo: any;
  let mockUserRepo: any;
  let mockOrderRepo: any;
  let mockDataSource: any;

  beforeEach(() => {
    mockClusterRepo = {
      find: vi.fn().mockResolvedValue([]),
      findOne: vi.fn(),
      create: vi.fn((dto) => ({ id: 'cluster-uuid', ...dto })),
      save: vi.fn(async (c) => ({ id: c.id || 'cluster-uuid', ...c })),
      createQueryBuilder: vi.fn(),
    };

    mockDeliveryRepo = {
      find: vi.fn(),
      update: vi.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: vi.fn(),
    };

    mockHubRepo = {
      findOne: vi.fn(),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    mockOrderRepo = {
      update: vi.fn().mockResolvedValue({ affected: 1 }),
    };

    mockDataSource = {
      transaction: vi.fn((cb) => cb({ findOne: vi.fn(), save: vi.fn() })),
    };

    service = new LogisticsDispatchService(
      mockClusterRepo,
      mockDeliveryRepo,
      mockHubRepo,
      mockUserRepo,
      mockOrderRepo,
      mockDataSource,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('suggestClusters', () => {
    it('should cluster pending deliveries by district and upazila with ferry alert for riverine areas', async () => {
      const mockDeliveries = [
        {
          id: 'del-1',
          orderId: 'ord-1',
          order: {
            id: 'ord-1',
            total: 1250,
            address: {
              contactName: 'Abdur Rahim',
              contactPhone: '01711000000',
              district: { nameEn: 'Bogra' },
              upazila: { nameEn: 'Sariakandi' },
              streetAddress: 'Chaluabari Char',
            },
          },
        },
        {
          id: 'del-2',
          orderId: 'ord-2',
          order: {
            id: 'ord-2',
            total: 800,
            address: {
              contactName: 'Fatema Begum',
              contactPhone: '01811000000',
              district: { nameEn: 'Bogra' },
              upazila: { nameEn: 'Sariakandi' },
              streetAddress: 'Hatikhero Ghat',
            },
          },
        },
      ];

      mockDeliveryRepo.createQueryBuilder.mockReturnValue({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue(mockDeliveries),
      });

      const suggestions = await service.suggestClusters('Bogra');

      expect(suggestions).toHaveLength(1);
      const first = suggestions[0];
      expect(first.district).toBe('Bogra');
      expect(first.upazila).toBe('Sariakandi');
      expect(first.deliveryCount).toBe(2);
      expect(first.totalCodAmount).toBe(2050);
      expect(first.requiresFerryCrossing).toBe(true);
      expect(first.ferryGhatName).toBe('Kalitola Jamuna Ghat');
      expect(first.fuelAllowanceBdt).toBeGreaterThan(0);
    });
  });

  describe('createDispatchRun', () => {
    it('should sequence waypoints and create a new dispatch run', async () => {
      const mockDeliveries = [
        {
          id: 'del-1',
          orderId: 'ord-1',
          order: {
            id: 'ord-1',
            total: 1200,
            address: {
              contactName: 'Karim Ali',
              contactPhone: '01711223344',
              district: { nameEn: 'Bogra' },
              upazila: { nameEn: 'Gabtali' },
              streetAddress: 'Perirhat Bazar',
            },
          },
        },
      ];

      mockDeliveryRepo.find.mockResolvedValue(mockDeliveries);
      mockUserRepo.findOne.mockResolvedValue({ id: 'rider-1', firstName: 'Rider' });

      const result = await service.createDispatchRun('admin-1', {
        title: 'Gabtali Circuit Run',
        division: 'Rajshahi',
        district: 'Bogra',
        upazila: 'Gabtali',
        riderId: 'rider-1',
        deliveryIds: ['del-1'],
      });

      expect(result).toBeDefined();
      expect(result.status).toBe(DispatchRunStatus.ASSIGNED);
      expect(result.waypoints).toHaveLength(1);
      expect(result.waypoints[0].sequence).toBe(1);
      expect(result.waypoints[0].recipientName).toBe('Karim Ali');
      expect(mockDeliveryRepo.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ riderId: 'rider-1', status: DeliveryStatus.ASSIGNED }),
      );
    });
  });

  describe('getRiderActiveRun', () => {
    it('should find active run for rider', async () => {
      const mockRun = { id: 'run-1', riderId: 'rider-1', status: DispatchRunStatus.IN_TRANSIT };
      mockClusterRepo.findOne.mockResolvedValue(mockRun);

      const active = await service.getRiderActiveRun('rider-1');
      expect(active).toBe(mockRun);
    });
  });

  describe('progressWaypoint', () => {
    it('should mark waypoint DELIVERED and update underlying delivery and order', async () => {
      const mockCluster = {
        id: 'cluster-1',
        riderId: 'rider-1',
        status: DispatchRunStatus.IN_TRANSIT,
        waypoints: [
          {
            sequence: 1,
            deliveryId: 'del-1',
            orderId: 'ord-1',
            status: WaypointStatus.PENDING,
          },
        ],
      };

      mockClusterRepo.findOne.mockResolvedValue(mockCluster);

      const updated = await service.progressWaypoint(
        'cluster-1',
        1,
        { status: WaypointStatus.DELIVERED, notes: 'Handed over' },
        'rider-1',
      );

      expect(updated.waypoints[0].status).toBe(WaypointStatus.DELIVERED);
      expect(updated.status).toBe(DispatchRunStatus.COMPLETED);
      expect(mockDeliveryRepo.update).toHaveBeenCalledWith(
        { id: 'del-1' },
        expect.objectContaining({ status: DeliveryStatus.DELIVERED }),
      );
      expect(mockOrderRepo.update).toHaveBeenCalledWith(
        { id: 'ord-1' },
        { status: OrderStatus.DELIVERED },
      );
    });
  });
});
