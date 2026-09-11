import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';

import type { PasswordHasher } from '../../../users/application/password-hasher';
import { User } from '../../../users/domain/entities/user.entity';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import { USER_ROLES } from '../../../users/domain/user-role';
import { LoginUseCase } from './login.use-case';

describe('LoginUseCase', () => {
  const userRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };
  const passwordHasher: jest.Mocked<PasswordHasher> = {
    compare: jest.fn(),
    hash: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService;

  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(userRepository, passwordHasher, jwtService);
  });

  it('throws UnauthorizedException when the user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'missing@example.com',
        password: 'password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the password is invalid', async () => {
    const now = new Date();
    userRepository.findByEmail.mockResolvedValue(
      new User(
        'user-1',
        'Operator',
        'operator@example.com',
        'stored-hash',
        USER_ROLES.OPERATOR,
        now,
        now,
      ),
    );
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'operator@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
