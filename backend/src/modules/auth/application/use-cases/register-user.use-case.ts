import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';

import { PASSWORD_HASHER } from '../../../users/application/password-hasher';
import type { PasswordHasher } from '../../../users/application/password-hasher';

import { User } from '../../../users/domain/entities/user.entity';

interface RegisterUserInput {
    name: string;
    email: string;
    password: string;
    role: User['role'];
}

@Injectable()
export class RegisterUserUseCase {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(PASSWORD_HASHER)
        private readonly passwordHasher: PasswordHasher,
    ) {}

    async execute(input: RegisterUserInput): Promise<void> {
        const existingUser = await this.userRepository.findByEmail(input.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }
        const passwordHash = await this.passwordHasher.hash(input.password);
        const now = new Date();
        const user = new User(
            randomUUID(),
            input.name,
            input.email,
            passwordHash,
            input.role,
            now,
            now,
        );

        await this.userRepository.create(user);
    }
}