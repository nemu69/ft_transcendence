import { Controller } from '@nestjs/common';
import { StatsService } from '../service/stats.service';

@Controller('stats')
export class StatsController {

    constructor(private userService: StatsService) {}
}
