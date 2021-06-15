import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './controller/stats.controller';
import { StatsEntity } from './models/stats.entity';
import { StatsService } from './service/stats.service';

@Module({
    imports: [
      TypeOrmModule.forFeature([StatsEntity])
    ],
    providers: [StatsService],
    controllers: [StatsController]
})
export class StatsModule {}
