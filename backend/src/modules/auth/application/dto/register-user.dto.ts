import { IsEmail, IsString, IsNotEmpty, IsIn } from 'class-validator';
import type { UserRole } from '../../../users/domain/user-role';
import { USER_ROLES } from '../../../users/domain/user-role';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn([USER_ROLES.OPERATOR, USER_ROLES.SUPERVISOR])
  role: UserRole;
}