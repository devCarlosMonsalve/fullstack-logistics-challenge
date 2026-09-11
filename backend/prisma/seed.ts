import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '../src/generated/prisma/client';

const databaseUrl = requireEnvironmentVariable('DATABASE_URL');
const email = requireEnvironmentVariable('SUPERVISOR_EMAIL').trim().toLowerCase();
const name = requireEnvironmentVariable('SUPERVISOR_NAME').trim();
const password = requireEnvironmentVariable('SUPERVISOR_PASSWORD');

if (!name) {
  throw new Error('SUPERVISOR_NAME must not be blank');
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('SUPERVISOR_EMAIL must be a valid email address');
}
if (password.length < 8) {
  throw new Error('SUPERVISOR_PASSWORD must contain at least 8 characters');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

async function seedSupervisor(): Promise<void> {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    if (existingUser.role !== Role.SUPERVISOR) {
      throw new Error(
        `A non-supervisor user already exists with email ${email}; choose another SUPERVISOR_EMAIL`,
      );
    }

    console.log(`Supervisor ${email} already exists; no changes made.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: Role.SUPERVISOR,
    },
  });
  console.log(`Created supervisor ${email}.`);
}

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

seedSupervisor()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
