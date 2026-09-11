import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';

import type { PasswordHasher } from '../../../users/application/password-hasher';
import { User } from '../../../users/domain/entities/user.entity';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import { USER_ROLES } from '../../../users/domain/user-role';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  const userRepository: jest.Mocked<UserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };
  const passwordHasher: jest.Mocked<PasswordHasher> = {
    compare: jest.fn(),
    hash: jest.fn(),
  };

  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUserUseCase(userRepository, passwordHasher);
  });

  it('throws ConflictException when the email is already registered', async () => {
    const now = new Date();
    userRepository.findByEmail.mockResolvedValue(
      new User(
        'user-1',
        'Existing User',
        'existing@example.com',
        'stored-hash',
        USER_ROLES.OPERATOR,
        now,
        now,
      ),
    );

    await expect(
      useCase.execute({
        name: 'Duplicate User',
        email: 'existing@example.com',
        password: 'password',
        role: USER_ROLES.OPERATOR,
      }),
    ).rejects.toThrow(ConflictException);
    expect(passwordHasher.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
