import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatsEntity } from '../models/stats.entity';

@Injectable()
export class StatsService {

    constructor(
        @InjectRepository(StatsEntity)
        private statsRepository: Repository<StatsEntity>
    ) {}
}
