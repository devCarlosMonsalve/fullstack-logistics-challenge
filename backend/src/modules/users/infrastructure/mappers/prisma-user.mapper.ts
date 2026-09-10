import { User } from '../../domain/entities/user.entity';
import type { User as PrismaUser } from '../../../../generated/prisma/client';

export class PrismaUserMapper {
  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.name,
      prismaUser.email,
      prismaUser.passwordHash,
      prismaUser.role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}