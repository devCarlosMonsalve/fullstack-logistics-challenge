import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { RegisterUserDto } from './application/dto/register-user.dto';
import { LoginDto } from './application/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('test')
  test(){
    return { message: 'Authenticated successfully' };
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.loginUseCase.execute(body);
  }

  @Post('register')
  async register(@Body() body: RegisterUserDto) {
    return this.registerUserUseCase.execute(body);
  }
}