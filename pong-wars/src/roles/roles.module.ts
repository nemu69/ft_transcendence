import { Module } from '@nestjs/common';
import { RolesService } from './service/roles.service';
import { RolesController } from './controller/roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from './models/roles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolesEntity])
  ],
  providers: [RolesService],
  controllers: [RolesController]
})
export class RolesModule {}
