import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductRequest } from './entities/product-request.entity.js';
import { ProductRequestHistory } from './entities/product-request-history.entity.js';
import { CreateProductRequestDto } from './dto/create-product-request.dto.js';
import { UpdateProductRequestStatusDto } from './dto/update-product-request-status.dto.js';
import { ProductRequestStatus } from './enums/product-request-status.enum.js';

@Injectable()
export class ProductRequestsService {
  constructor(
    @InjectRepository(ProductRequest)
    private readonly requestRepository: Repository<ProductRequest>,
    private readonly dataSource: DataSource,
  ) {}

  async create(userId: string, createDto: CreateProductRequestDto) {
    return this.dataSource.transaction(async (manager) => {
      const request = new ProductRequest();
      request.userId = userId;
      request.requestedProductName = createDto.requestedProductName;
      request.description = createDto.description ?? null;
      request.preferredInformation = createDto.preferredInformation ?? null;
      request.status = ProductRequestStatus.PENDING;

      const history = new ProductRequestHistory();
      history.status = ProductRequestStatus.PENDING;
      history.remark = 'Request submitted by customer';

      request.statusHistory = [history];

      return manager.save(ProductRequest, request);
    });
  }

  async findAllCustomer(userId: string) {
    return this.requestRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneCustomer(userId: string, id: string) {
    const request = await this.requestRepository.findOne({
      where: { id, userId },
      relations: ['statusHistory', 'linkedProduct'],
      order: {
        statusHistory: {
          createdAt: 'DESC'
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Product request not found');
    }

    return request;
  }

  async findAllAdmin(status?: ProductRequestStatus, search?: string) {
    const query = this.requestRepository.createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .orderBy('request.createdAt', 'DESC');

    if (status) {
      query.andWhere('request.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(request.requestedProductName ILIKE :search OR user.name ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    return query.getMany();
  }

  async findOneAdmin(id: string) {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['user', 'statusHistory', 'statusHistory.changedByUser', 'linkedProduct'],
      order: {
        statusHistory: {
          createdAt: 'DESC'
        }
      }
    });

    if (!request) {
      throw new NotFoundException('Product request not found');
    }

    return request;
  }

  async updateStatus(
    id: string,
    adminId: string,
    updateDto: UpdateProductRequestStatusDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(ProductRequest, {
        where: { id },
      });

      if (!request) {
        throw new NotFoundException('Product request not found');
      }

      request.status = updateDto.status;
      if (updateDto.adminNotes !== undefined) {
        request.adminNotes = updateDto.adminNotes;
      }
      if (updateDto.linkedProductId !== undefined) {
        request.linkedProductId = updateDto.linkedProductId;
      }

      const history = new ProductRequestHistory();
      history.productRequestId = request.id;
      history.status = updateDto.status;
      history.remark = updateDto.remark || `Status changed to ${updateDto.status}`;
      history.changedByUserId = adminId;

      await manager.save(ProductRequestHistory, history);
      return manager.save(ProductRequest, request);
    });
  }
}
