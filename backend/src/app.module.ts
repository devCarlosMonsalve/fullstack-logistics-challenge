import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule, 
    AuthModule, 
    ShipmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
