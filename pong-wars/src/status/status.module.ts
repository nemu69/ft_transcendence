import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusEntity } from 'src/status/models/status.entity';
import { StatusController } from './controller/status.controller';
import { StatusService } from './service/status.service';

@Module({
    imports: [
      TypeOrmModule.forFeature([StatusEntity])
    ],
    providers: [StatusService],
    controllers: [StatusController]
  })
export class StatusModule {}
