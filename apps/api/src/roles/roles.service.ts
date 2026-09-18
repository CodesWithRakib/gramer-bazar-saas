import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity.js';
import { Role } from './enums/role.enum.js';

@Injectable()
export class RolesService implements OnModuleInit {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async onModuleInit() {
    await this.seedRoles();
  }

  private async seedRoles() {
    const roleValues = Object.values(Role);
    for (const name of roleValues) {
      const existing = await this.roleRepository.findOne({ where: { name } });
      if (!existing) {
        await this.roleRepository.save(this.roleRepository.create({ name, description: name }));
        this.logger.log(`Seeded role: ${name}`);
      }
    }
  }
}
