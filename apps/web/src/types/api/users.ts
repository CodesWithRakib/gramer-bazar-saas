import type { Schema } from './common.js';

export type User = Schema<'UserResponseDto'>;
export type UserRole = Schema<'UserRoleDto'>;
export type CreateUserRequest = Schema<'CreateUserDto'>;
export type UpdateUserStatusRequest = Schema<'UpdateUserStatusDto'>;
export type UpdateUserRolesRequest = Schema<'UpdateUserRolesDto'>;
