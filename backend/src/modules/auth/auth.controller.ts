import { Controller, Post, Body } from '@nestjs/common';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LoginDto } from './application/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.loginUseCase.execute(body);
  }
}