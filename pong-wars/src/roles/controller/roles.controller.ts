import { Controller } from '@nestjs/common';
import { RolesService } from '../service/roles.service';

@Controller('roles')
export class RolesController {

    constructor(private rolesService: RolesService) {}
}
