import { describe, expect, it } from '@jest/globals';
import { GUARDS_METADATA } from '@nestjs/common/constants';

import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShipmentsController } from './shipments.controller';

describe('ShipmentsController', () => {
  it('restricts vehicle assignment to authenticated supervisors', () => {
    const handler = ShipmentsController.prototype.assignVehicles;

    expect(Reflect.getMetadata('roles', handler)).toEqual(['SUPERVISOR']);
    expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([
      JwtAuthGuard,
      RolesGuard,
    ]);
  });
});
