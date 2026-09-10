import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './auth.controller';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' },
  }), UsersModule],
  controllers: [AuthController],
  providers: [LoginUseCase],
  exports: [LoginUseCase],
})
export class AuthModule {}