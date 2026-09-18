import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity.js';
import { User } from '../users/entities/user.entity.js';
import { Product } from '../catalog/entities/product.entity.js';
import { OrderStatus } from '../orders/enums/order-status.enum.js';
import { Role } from '../roles/enums/role.enum.js';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getDashboardMetrics() {
    // Basic metrics
    const totalOrders = await this.orderRepository.count();
    const pendingOrders = await this.orderRepository.count({ where: { status: OrderStatus.PENDING } });
    
    // Calculate total sales (sum of delivered/completed orders)
    const salesResult = await this.orderRepository.createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.DELIVERED })
      .select('SUM(order.total)', 'total')
      .getRawOne();
      
    const totalSales = Number(salesResult?.total) || 0;

    // User metrics
    const totalCustomers = await this.userRepository.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.CUSTOMER })
      .getCount();

    const totalSellers = await this.userRepository.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.SELLER })
      .getCount();
      
    const totalRiders = await this.userRepository.createQueryBuilder('user')
      .innerJoin('user.roles', 'role')
      .where('role.name = :role', { role: Role.RIDER })
      .getCount();

    const totalProducts = await this.productRepository.count();

    // Recent orders (last 5)
    const recentOrders = await this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: ['user'],
    });

    return {
      metrics: {
        totalOrders,
        pendingOrders,
        totalSales,
        totalCustomers,
        totalSellers,
        totalRiders,
        totalProducts,
      },
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        customerName: o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Unknown',
        totalAmount: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
    };
  }
}
