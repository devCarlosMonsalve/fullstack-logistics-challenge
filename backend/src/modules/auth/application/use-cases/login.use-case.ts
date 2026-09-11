import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { PasswordHasher } from '../../../users/application/password-hasher';
import type { UserRepository } from '../../../users/domain/repositories/user.repository';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import { PASSWORD_HASHER } from '../../../users/application/password-hasher';
import { JwtService } from '@nestjs/jwt';

interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: LoginInput){
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
        sub: user.id, 
        email: user.email, 
        role: user.role });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  }
}