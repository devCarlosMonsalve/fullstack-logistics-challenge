import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { AuthController } from './auth.controller';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';

@Module({
  imports: [ConfigModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.getOrThrow<string>('JWT_SECRET'),
      signOptions: { expiresIn: '1h' },
    }),
  }), UsersModule],
  controllers: [AuthController],
  providers: [LoginUseCase, RegisterUserUseCase],
  exports: [LoginUseCase, RegisterUserUseCase],
})
export class AuthModule {}