import * as bcrypt from 'bcryptjs';
import type { PasswordHasher } from '../../application/password-hasher';

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}