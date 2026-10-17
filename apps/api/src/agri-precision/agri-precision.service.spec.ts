import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgriPrecisionService } from './agri-precision.service.js';
import {
  CropTargetNutrient,
  DroneBookingStatus,
  DroneServiceType,
  InputCategory,
  InputVerificationStatus,
  SoilTextureType,
} from './enums/agri-precision.enum.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AgriPrecisionService', () => {
  let service: AgriPrecisionService;
  let mockInputRepo: any;
  let mockReportRepo: any;
  let mockDroneUnitRepo: any;
  let mockDroneBookingRepo: any;
  let mockSoilCardRepo: any;
  let mockUserRepo: any;

  beforeEach(() => {
    mockInputRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'input-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'input-uuid-1', ...entity })),
      count: vi.fn().mockResolvedValue(5),
    };

    mockReportRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'report-uuid-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'report-uuid-1', ...entity })),
      count: vi.fn().mockResolvedValue(2),
    };

    mockDroneUnitRepo = {
      findOne: vi.fn(),
      findAndCount: vi.fn(),
      create: vi.fn((entity) => ({ id: 'drone-unit-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'drone-unit-1', ...entity })),
      count: vi.fn().mockResolvedValue(3),
      createQueryBuilder: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        addSelect: vi.fn().mockReturnThis(),
        getRawOne: vi.fn().mockResolvedValue({
          totalAcres: 535.5,
          totalWater: 80300,
        }),
      })),
    };

    mockDroneBookingRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'drone-booking-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'drone-booking-1', ...entity })),
      count: vi.fn().mockResolvedValue(10),
      createQueryBuilder: vi.fn(() => ({
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        getMany: vi.fn().mockResolvedValue([]),
      })),
    };

    mockSoilCardRepo = {
      findOne: vi.fn(),
      find: vi.fn(),
      create: vi.fn((entity) => ({ id: 'soil-card-1', ...entity })),
      save: vi.fn((entity) => Promise.resolve({ id: 'soil-card-1', ...entity })),
      count: vi.fn().mockResolvedValue(15),
    };

    mockUserRepo = {
      findOne: vi.fn(),
    };

    service = new AgriPrecisionService(
      mockInputRepo,
      mockReportRepo,
      mockDroneUnitRepo,
      mockDroneBookingRepo,
      mockSoilCardRepo,
      mockUserRepo,
    );
  });

  describe('verifyInput', () => {
    it('should return authentic status when valid certified chemical exists', async () => {
      mockInputRepo.findOne.mockResolvedValue({
        id: 'input-1',
        barcodeOrQrCode: 'CHEM-SYN-VIRTAKO-40WG',
        brandName: 'Virtako 40WG',
        manufacturerName: 'Syngenta Bangladesh Ltd.',
        expiryDate: new Date('2028-01-01'),
        status: InputVerificationStatus.AUTHENTIC_CERTIFIED,
        daeRegistrationNo: 'DAE-AP-1428',
      });

      const res = await service.verifyInput('CHEM-SYN-VIRTAKO-40WG');

      expect(res.isAuthentic).toBe(true);
      expect(res.status).toBe(InputVerificationStatus.AUTHENTIC_CERTIFIED);
      expect(res.item?.brandName).toBe('Virtako 40WG');
    });

    it('should return suspicious counterfeit if barcode is not in registry', async () => {
      mockInputRepo.findOne.mockResolvedValue(null);

      const res = await service.verifyInput('FAKE-BARCODE-999');

      expect(res.isAuthentic).toBe(false);
      expect(res.status).toBe(InputVerificationStatus.SUSPICIOUS_COUNTERFEIT);
    });

    it('should return expired status if chemical expiry date has passed', async () => {
      mockInputRepo.findOne.mockResolvedValue({
        id: 'input-2',
        barcodeOrQrCode: 'CHEM-EXPIRED-01',
        brandName: 'Expired Fungicide',
        expiryDate: new Date('2024-01-01'),
        status: InputVerificationStatus.AUTHENTIC_CERTIFIED,
      });

      const res = await service.verifyInput('CHEM-EXPIRED-01');

      expect(res.isAuthentic).toBe(false);
      expect(res.status).toBe(InputVerificationStatus.EXPIRED);
    });
  });

  describe('reportCounterfeit', () => {
    it('should create a counterfeit report ticket and increment reports count', async () => {
      mockInputRepo.findOne.mockResolvedValue({
        id: 'item-1',
        barcodeOrQrCode: 'CHEM-SUSPECT-01',
        counterfeitReportsCount: 2,
        status: InputVerificationStatus.AUTHENTIC_CERTIFIED,
      });

      const report = await service.reportCounterfeit('user-1', {
        suspectedItemBarcode: 'CHEM-SUSPECT-01',
        brandName: 'Virtako Copy',
        reporterName: 'Abdur Rahim',
        reporterPhone: '01700000000',
        retailShopName: 'Hazi Agro Traders',
        retailShopDistrict: 'Bogura',
        retailShopUpazila: 'Shibganj',
        retailShopAddress: 'Mokamtola Bazar',
        suspectedDefectDescription: 'White chalk powder, no smell, insects unaffected',
      });

      expect(report.reportTicketNo).toContain('RPT-2026-');
      expect(mockInputRepo.save).toHaveBeenCalled();
    });
  });

  describe('bookDroneSpraying', () => {
    it('should calculate booking cost and water savings (184 L/bigha) accurately', async () => {
      mockDroneUnitRepo.findOne.mockResolvedValue({
        id: 'drone-1',
        serviceRatePerBigha: 180.0,
      });

      const booking = await service.bookDroneSpraying('farmer-1', {
        droneUnitId: 'drone-1',
        serviceType: DroneServiceType.FUNGICIDE_BLIGHT_SPRAY,
        targetCrop: 'Potato',
        targetInfestationOrFormula: 'Late Blight Mancozeb',
        farmerName: 'Md. Tariqul Islam',
        farmerPhone: '01711223344',
        plotAddress: 'Village Pirgacha, Bogura',
        plotDistrict: 'Bogura',
        plotUpazila: 'Pirgacha',
        landAreaBighas: 4.0,
        scheduledDate: '2026-11-20',
        scheduledTimeSlot: '06:30 AM - 08:30 AM',
      });

      expect(booking.landAreaBighas).toBe(4.0);
      expect(booking.totalBookingCost).toBe(720.0); // 4 * 180
      expect(booking.waterSavedLiters).toBe(736.0); // 4 * 184
      expect(booking.status).toBe(DroneBookingStatus.REQUESTED);
    });
  });

  describe('generateSoilHealthCard', () => {
    it('should calculate fertilizer requirements and recommend lime for acidic soil (pH < 5.5)', async () => {
      const card = await service.generateSoilHealthCard('farmer-1', {
        farmerName: 'Shahidul Alam',
        farmerPhone: '01712345678',
        plotAddress: 'Village Chandpur, Bogura',
        plotDistrict: 'Bogura',
        plotUpazila: 'Shibganj',
        soilTexture: SoilTextureType.CLAY_LOAM,
        targetCrop: CropTargetNutrient.POTATO,
        landAreaBighas: 1.0,
        phLevel: 5.2, // Acidic: should trigger Dolomite Lime advice
        nitrogenKgPerHa: 120, // Low N
        phosphorusPpm: 8.5, // Low P
        potassiumMeqPer100g: 0.12, // Low K
        organicMatterPct: 1.1, // Low OM
        zincPpm: 0.8,
      });

      expect(card.calculatedUreaKgPerBigha).toBeGreaterThan(36); // adjusted for low N and OM
      expect(card.calculatedTspKgPerBigha).toBeGreaterThan(28); // adjusted for low P
      expect(card.calculatedMopKgPerBigha).toBeGreaterThan(32); // adjusted for low K
      expect(card.phCorrectionAdvice).toContain('ডলোমাইট চুন'); // Lime advice included
    });
  });
});
