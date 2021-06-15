import { Controller } from '@nestjs/common';
import { StatusService } from 'src/status/service/status.service';

@Controller('status')
export class StatusController {

    constructor(private statusService: StatusService) {}
}
