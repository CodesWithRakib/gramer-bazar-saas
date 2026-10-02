import 'reflect-metadata';
import { describe, it, expect } from 'vitest';

import { BroadcastTemplatesController } from './broadcast-templates.controller.js';
import { BroadcastAudienceController } from './broadcast-audience.controller.js';
import { BroadcastCampaignsController } from './broadcast-campaigns.controller.js';
import { ROLES_KEY } from '../../common/decorators/roles.decorator.js';
import { Role } from '../../roles/enums/role.enum.js';

describe('Broadcast authorization', () => {
  const controllers = [
    BroadcastTemplatesController,
    BroadcastAudienceController,
    BroadcastCampaignsController,
  ];

  it.each(controllers)('%s is restricted to SUPER_ADMIN at the controller level', (controller) => {
    const roles = Reflect.getMetadata(ROLES_KEY, controller);
    expect(roles).toEqual([Role.SUPER_ADMIN]);
  });

  it('does not accidentally restrict to a broader role set', () => {
    for (const controller of controllers) {
      const roles = Reflect.getMetadata(ROLES_KEY, controller) as Role[];
      expect(roles).not.toContain(Role.ADMIN);
      expect(roles).not.toContain(Role.CUSTOMER);
      expect(roles).not.toContain(Role.SELLER);
      expect(roles).not.toContain(Role.RIDER);
    }
  });
});
