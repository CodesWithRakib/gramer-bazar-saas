import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { DispatchCluster, WaypointStop } from '../entities/dispatch-cluster.entity.js';
import { DispatchRunStatus, WaypointStatus } from '../enums/dispatch-run-status.enum.js';
import { Delivery } from '../entities/delivery.entity.js';
import { DeliveryStatus } from '../enums/delivery-status.enum.js';
import { Order } from '../../orders/entities/order.entity.js';
import { OrderStatus } from '../../orders/enums/order-status.enum.js';
import { User } from '../../users/entities/user.entity.js';
import { WarehouseHub } from '../../inventory/entities/warehouse-hub.entity.js';
import {
  CreateDispatchClusterDto,
  UpdateDispatchRunStatusDto,
  ProgressWaypointDto,
} from '../dto/dispatch-cluster.dto.js';

interface GeoLocation {
  lat: number;
  lng: number;
  ferry?: boolean;
  ghat?: string;
}

const RURAL_LOCATION_COORDINATES: Record<string, GeoLocation> = {
  'bogra:sadar': { lat: 24.8465, lng: 89.3778 },
  'bogra:gabtali': { lat: 24.8872, lng: 89.5167 },
  'bogra:sariakandi': { lat: 24.8833, lng: 89.6167, ferry: true, ghat: 'Kalitola Jamuna Ghat' },
  'bogra:shajahanpur': { lat: 24.7667, lng: 89.3833 },
  'bogra:sherpur': { lat: 24.6667, lng: 89.4167 },
  'rangpur:sadar': { lat: 25.7439, lng: 89.2752 },
  'rangpur:mithapukur': { lat: 25.5786, lng: 89.2833 },
  'dinajpur:sadar': { lat: 25.6279, lng: 88.6332 },
  'dinajpur:birganj': { lat: 25.8569, lng: 88.6639 },
  'jessore:sadar': { lat: 23.1664, lng: 89.2081 },
  'jessore:jhikargachha': { lat: 23.1042, lng: 89.1333 },
  'faridpur:sadar': { lat: 23.6071, lng: 89.8429 },
  'faridpur:goalanda': { lat: 23.7333, lng: 89.7667, ferry: true, ghat: 'Daulatdia-Paturia Ghat' },
  'pabna:sadar': { lat: 24.0129, lng: 89.2483 },
  'pabna:ishwardi': { lat: 24.1292, lng: 89.0667 },
  'sirajganj:sadar': { lat: 24.4534, lng: 89.7008 },
  'sirajganj:kazipur': { lat: 24.6667, lng: 89.6500, ferry: true, ghat: 'Meghai Jamuna Ghat' },
  'natore:sadar': { lat: 24.4102, lng: 88.9799 },
  'dhaka:sadar': { lat: 23.8103, lng: 90.4125 },
};

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface ClusterSuggestion {
  division: string;
  district: string;
  upazila: string;
  deliveryCount: number;
  totalCodAmount: number;
  estimatedDistanceKm: number;
  estimatedDurationMinutes: number;
  fuelAllowanceBdt: number;
  requiresFerryCrossing: boolean;
  ferryGhatName: string | null;
  deliveries: Array<{
    deliveryId: string;
    orderId: string;
    recipientName: string;
    recipientPhone: string;
    union?: string;
    villageAddress: string;
    codAmount: number;
  }>;
}

@Injectable()
export class LogisticsDispatchService {
  constructor(
    @InjectRepository(DispatchCluster)
    private readonly clusterRepository: Repository<DispatchCluster>,
    @InjectRepository(Delivery)
    private readonly deliveryRepository: Repository<Delivery>,
    @InjectRepository(WarehouseHub)
    private readonly hubRepository: Repository<WarehouseHub>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Resolve best estimate geographic coordinates for a given address
   */
  resolveCoordinates(
    district: string,
    upazila?: string,
    customLat?: number | null,
    customLng?: number | null,
  ): GeoLocation {
    if (customLat && customLng) {
      return { lat: Number(customLat), lng: Number(customLng) };
    }
    const key = `${district?.toLowerCase().trim()}:${(upazila || 'sadar').toLowerCase().trim()}`;
    if (RURAL_LOCATION_COORDINATES[key]) {
      return RURAL_LOCATION_COORDINATES[key];
    }
    const fallbackKey = `${district?.toLowerCase().trim()}:sadar`;
    if (RURAL_LOCATION_COORDINATES[fallbackKey]) {
      return RURAL_LOCATION_COORDINATES[fallbackKey];
    }
    return { lat: 24.0, lng: 89.5 }; // Geometric center of Bangladesh
  }

  /**
   * Suggest automated clusters by Upazila / Union for pending deliveries
   */
  async suggestClusters(district?: string, hubId?: string): Promise<ClusterSuggestion[]> {
    // 1. Find all active clusters to exclude already clustered deliveries
    const activeClusters = await this.clusterRepository.find({
      where: {
        status: In([
          DispatchRunStatus.PLANNED,
          DispatchRunStatus.ASSIGNED,
          DispatchRunStatus.IN_TRANSIT,
        ]),
      },
    });

    const clusteredDeliveryIds = new Set<string>();
    for (const cluster of activeClusters) {
      for (const wp of cluster.waypoints || []) {
        if (wp.deliveryId) {
          clusteredDeliveryIds.add(wp.deliveryId);
        }
      }
    }

    // 2. Fetch pending deliveries
    const query = this.deliveryRepository
      .createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.order', 'order')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('address.district', 'dist')
      .leftJoinAndSelect('address.upazila', 'upz')
      .leftJoinAndSelect('address.union', 'un')
      .where('delivery.status IN (:...statuses)', {
        statuses: [DeliveryStatus.UNASSIGNED, DeliveryStatus.ASSIGNED],
      });

    const deliveries = await query.getMany();

    // 3. Filter unclustered deliveries
    const available = deliveries.filter((d) => !clusteredDeliveryIds.has(d.id));

    // 4. Group by District & Upazila
    const groups: Record<string, Delivery[]> = {};
    for (const d of available) {
      const order = d.order;
      const addr = order?.address;
      const distName = addr?.district?.nameEn || addr?.streetAddress || 'General';
      const upzName = addr?.upazila?.nameEn || 'Sadar';

      if (district && distName.toLowerCase() !== district.toLowerCase()) {
        continue;
      }

      const groupKey = `${distName}:::${upzName}`;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(d);
    }

    // 5. Build cluster suggestions
    const suggestions: ClusterSuggestion[] = [];

    for (const [key, delList] of Object.entries(groups)) {
      const [distName, upzName] = key.split(':::');
      const coords = this.resolveCoordinates(distName, upzName);

      let totalCod = 0;
      const deliveryItems = delList.map((d) => {
        const cod = Number(d.order?.total) || 0;
        totalCod += cod;
        return {
          deliveryId: d.id,
          orderId: d.orderId,
          recipientName: d.order?.address?.contactName || 'Customer',
          recipientPhone: d.order?.address?.contactPhone || 'N/A',
          union: d.order?.address?.union?.nameEn,
          villageAddress: d.order?.address?.streetAddress || 'Village area',
          codAmount: cod,
        };
      });

      // Calculate approximate multi-stop route metrics
      // Base hub distance + (number of stops * avg inter-village distance ~ 3.5 km)
      const stopCount = delList.length;
      const estDistance = Math.round((12.5 + stopCount * 3.8) * 10) / 10;
      const estDuration = Math.round(estDistance * 2.2 + stopCount * 12 + (coords.ferry ? 50 : 0));
      const fuelAllowance = Math.round(estDistance * 3.5 + 50 + (coords.ferry ? 60 : 0));

      suggestions.push({
        division: delList[0].order?.address?.division?.nameEn || 'Rajshahi',
        district: distName,
        upazila: upzName,
        deliveryCount: stopCount,
        totalCodAmount: totalCod,
        estimatedDistanceKm: estDistance,
        estimatedDurationMinutes: estDuration,
        fuelAllowanceBdt: fuelAllowance,
        requiresFerryCrossing: !!coords.ferry,
        ferryGhatName: coords.ghat || null,
        deliveries: deliveryItems,
      });
    }

    return suggestions.sort((a, b) => b.deliveryCount - a.deliveryCount);
  }

  /**
   * Create a new formal Dispatch Run Cluster and sequence waypoints using nearest-neighbor heuristic
   */
  async createDispatchRun(adminId: string, dto: CreateDispatchClusterDto): Promise<DispatchCluster> {
    if (!dto.deliveryIds || dto.deliveryIds.length === 0) {
      throw new BadRequestException('At least one delivery must be bundled into a dispatch run.');
    }

    const deliveries = await this.deliveryRepository.find({
      where: { id: In(dto.deliveryIds) },
      relations: ['order', 'order.address', 'order.address.district', 'order.address.upazila', 'order.address.union'],
    });

    if (deliveries.length !== dto.deliveryIds.length) {
      throw new NotFoundException('One or more delivery records could not be found.');
    }

    let rider: User | null = null;
    if (dto.riderId) {
      rider = await this.userRepository.findOne({ where: { id: dto.riderId } });
      if (!rider) {
        throw new NotFoundException('Specified rider not found.');
      }
    }

    let hub: WarehouseHub | null = null;
    if (dto.hubId) {
      hub = await this.hubRepository.findOne({ where: { id: dto.hubId } });
    }

    const originCoords = hub
      ? this.resolveCoordinates(hub.district, hub.upazila || 'sadar')
      : this.resolveCoordinates(dto.district, dto.upazila);

    // Sequence waypoints using nearest neighbor heuristic
    const unvisited = [...deliveries];
    const sequencedWaypoints: WaypointStop[] = [];
    let currentPoint = { lat: originCoords.lat, lng: originCoords.lng };
    let totalKm = 0;
    let sequenceCounter = 1;
    let hasFerry = !!originCoords.ferry;
    let ferryGhat = dto.ferryGhatName || originCoords.ghat || null;

    while (unvisited.length > 0) {
      let nearestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < unvisited.length; i++) {
        const item = unvisited[i];
        const addr = item.order?.address;
        const targetCoords = this.resolveCoordinates(
          addr?.district?.nameEn || dto.district,
          addr?.upazila?.nameEn || dto.upazila,
          addr?.lat,
          addr?.lng,
        );

        if (targetCoords.ferry) {
          hasFerry = true;
          if (!ferryGhat) ferryGhat = targetCoords.ghat || 'Regional River Ghat';
        }

        const dist = haversineDistanceKm(
          currentPoint.lat,
          currentPoint.lng,
          targetCoords.lat,
          targetCoords.lng,
        );

        if (dist < minDistance) {
          minDistance = dist;
          nearestIndex = i;
        }
      }

      const selected = unvisited.splice(nearestIndex, 1)[0];
      const addr = selected.order?.address;
      const selectedCoords = this.resolveCoordinates(
        addr?.district?.nameEn || dto.district,
        addr?.upazila?.nameEn || dto.upazila,
        addr?.lat,
        addr?.lng,
      );

      totalKm += minDistance;
      currentPoint = { lat: selectedCoords.lat, lng: selectedCoords.lng };

      sequencedWaypoints.push({
        sequence: sequenceCounter++,
        deliveryId: selected.id,
        orderId: selected.orderId,
        orderNumber: selected.order?.id?.slice(0, 8).toUpperCase(),
        recipientName: addr?.contactName || 'Customer',
        recipientPhone: addr?.contactPhone || 'N/A',
        division: addr?.division?.nameEn || dto.division,
        district: addr?.district?.nameEn || dto.district,
        upazila: addr?.upazila?.nameEn || dto.upazila,
        union: addr?.union?.nameEn || 'Village Union',
        villageAddress: addr?.streetAddress || 'Village area',
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
        codAmount: Number(selected.order?.total) || 0,
        status: WaypointStatus.PENDING,
      });
    }

    // Return leg to hub/origin
    const returnKm = haversineDistanceKm(
      currentPoint.lat,
      currentPoint.lng,
      originCoords.lat,
      originCoords.lng,
    );
    totalKm = Math.round((totalKm + returnKm) * 10) / 10;

    const stopCount = sequencedWaypoints.length;
    const estMinutes = Math.round(totalKm * 2.2 + stopCount * 12 + (hasFerry ? 50 : 0));
    const fuelAllowance = Math.round(totalKm * 3.5 + 50 + (hasFerry ? 60 : 0));

    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const distCode = dto.district.substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const runCode = `RUN-${datePrefix}-${distCode}-${randomSuffix}`;

    const cluster = this.clusterRepository.create({
      runCode,
      title: dto.title,
      hubId: dto.hubId || null,
      riderId: dto.riderId || null,
      division: dto.division,
      district: dto.district,
      upazila: dto.upazila,
      status: dto.riderId ? DispatchRunStatus.ASSIGNED : DispatchRunStatus.PLANNED,
      totalDistanceKm: totalKm,
      estimatedDurationMinutes: estMinutes,
      fuelAllowanceBdt: fuelAllowance,
      requiresFerryCrossing: hasFerry,
      ferryGhatName: ferryGhat,
      ferryWaitMinutes: hasFerry ? 45 : 0,
      waypoints: sequencedWaypoints,
      dispatchedAt: null,
      completedAt: null,
    });

    const saved = await this.clusterRepository.save(cluster);

    // Update underlying deliveries with rider assignment
    if (dto.riderId) {
      await this.deliveryRepository.update(
        { id: In(dto.deliveryIds) },
        { riderId: dto.riderId, status: DeliveryStatus.ASSIGNED, assignedAt: new Date() },
      );
    }

    return saved;
  }

  /**
   * Get active run for the currently logged-in rider
   */
  async getRiderActiveRun(riderId: string): Promise<DispatchCluster | null> {
    return this.clusterRepository.findOne({
      where: {
        riderId,
        status: In([DispatchRunStatus.ASSIGNED, DispatchRunStatus.IN_TRANSIT]),
      },
      relations: ['hub', 'rider'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update dispatch run status (START run, COMPLETE, CANCEL)
   */
  async updateRunStatus(
    id: string,
    dto: UpdateDispatchRunStatusDto,
    userId: string,
  ): Promise<DispatchCluster> {
    const cluster = await this.clusterRepository.findOne({
      where: { id },
      relations: ['hub', 'rider'],
    });

    if (!cluster) {
      throw new NotFoundException('Dispatch run not found.');
    }

    cluster.status = dto.status;

    if (dto.status === DispatchRunStatus.IN_TRANSIT) {
      cluster.dispatchedAt = new Date();
      // Update all underlying deliveries to OUT_FOR_DELIVERY
      const deliveryIds = cluster.waypoints.map((w) => w.deliveryId).filter(Boolean);
      if (deliveryIds.length > 0) {
        await this.deliveryRepository.update(
          { id: In(deliveryIds) },
          { status: DeliveryStatus.OUT_FOR_DELIVERY },
        );
      }
    } else if (dto.status === DispatchRunStatus.COMPLETED) {
      cluster.completedAt = new Date();
    } else if (dto.status === DispatchRunStatus.CANCELLED) {
      // Revert underlying deliveries back to UNASSIGNED
      const deliveryIds = cluster.waypoints.map((w) => w.deliveryId).filter(Boolean);
      if (deliveryIds.length > 0) {
        await this.deliveryRepository.update(
          { id: In(deliveryIds) },
          { status: DeliveryStatus.UNASSIGNED, riderId: null },
        );
      }
    }

    return this.clusterRepository.save(cluster);
  }

  /**
   * Progress a waypoint stop (mark ARRIVED or DELIVERED)
   */
  async progressWaypoint(
    id: string,
    sequence: number,
    dto: ProgressWaypointDto,
    riderId?: string,
  ): Promise<DispatchCluster> {
    const cluster = await this.clusterRepository.findOne({
      where: { id },
      relations: ['hub', 'rider'],
    });

    if (!cluster) {
      throw new NotFoundException('Dispatch run not found.');
    }

    if (riderId && cluster.riderId !== riderId) {
      throw new BadRequestException('You are not authorized to update this dispatch run.');
    }

    const waypoint = cluster.waypoints.find((w) => w.sequence === Number(sequence));
    if (!waypoint) {
      throw new NotFoundException(`Waypoint stop #${sequence} not found in this run.`);
    }

    waypoint.status = dto.status;
    if (dto.notes) {
      waypoint.notes = dto.notes;
    }

    const nowIso = new Date().toISOString();
    if (dto.status === WaypointStatus.ARRIVED) {
      waypoint.arrivedAt = nowIso;
    } else if (dto.status === WaypointStatus.DELIVERED) {
      waypoint.completedAt = nowIso;

      // Update underlying delivery
      if (waypoint.deliveryId) {
        await this.deliveryRepository.update(
          { id: waypoint.deliveryId },
          { status: DeliveryStatus.DELIVERED, deliveryTime: new Date() },
        );
      }

      // Update underlying order to DELIVERED
      if (waypoint.orderId) {
        await this.orderRepository.update(
          { id: waypoint.orderId },
          { status: OrderStatus.DELIVERED },
        );
      }
    }

    // If all waypoints delivered or failed, mark the cluster completed
    const allTerminal = cluster.waypoints.every(
      (w) => w.status === WaypointStatus.DELIVERED || w.status === WaypointStatus.FAILED,
    );

    if (allTerminal) {
      cluster.status = DispatchRunStatus.COMPLETED;
      cluster.completedAt = new Date();
    }

    return this.clusterRepository.save(cluster);
  }

  /**
   * Get all dispatch clusters with pagination and filters
   */
  async getAllRuns(page = 1, limit = 20, status?: DispatchRunStatus, district?: string) {
    const query = this.clusterRepository
      .createQueryBuilder('cluster')
      .leftJoinAndSelect('cluster.hub', 'hub')
      .leftJoinAndSelect('cluster.rider', 'rider')
      .orderBy('cluster.createdAt', 'DESC');

    if (status) {
      query.andWhere('cluster.status = :status', { status });
    }

    if (district) {
      query.andWhere('LOWER(cluster.district) = LOWER(:district)', { district });
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
