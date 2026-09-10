import { USER_ROLES } from '../user-role';
import type { UserRole } from '../user-role';

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  get isOperator(): boolean {
    return this.role === USER_ROLES.OPERATOR;
  }
  get isSupervisor(): boolean {
    return this.role === USER_ROLES.SUPERVISOR;
  }
}