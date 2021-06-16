import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesEntity } from '../models/roles.entity';

@Injectable()
export class RolesService {

    constructor(
        @InjectRepository(RolesEntity)
        private rolesRepository: Repository<RolesEntity>
    ) {}
}
