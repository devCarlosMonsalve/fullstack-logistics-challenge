import { Injectable, Inject } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';
import { PASSWORD_HASHER } from '../password-hasher';
import type { PasswordHasher } from '../password-hasher';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(user: User): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await this.passwordHasher.hash(user.passwordHash);
    
    const userWithHashedPassword = new User(
      user.id,
      user.name,
      user.email,
      passwordHash,
      user.role,
      user.createdAt,
      user.updatedAt,
    );
    await this.userRepository.create(userWithHashedPassword);
  }
}