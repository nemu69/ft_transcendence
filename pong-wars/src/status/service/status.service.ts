import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusEntity } from 'src/status/models/status.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatusService {

    constructor(
        @InjectRepository(StatusEntity)
        private statusRepository: Repository<StatusEntity>
    ) {}
}
