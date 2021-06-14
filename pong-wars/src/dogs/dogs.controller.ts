import { Controller, Get } from '@nestjs/common';
import { DogsService } from './dogs.service';

@Controller('dogs')
export class DogsController {
    constructor (private dogsService: DogsService) {}

    @Get()
    async getDogs() {
        return this.dogsService.getDogs();
    }

    @Get('jj')
    async getDogs2() {
        return this.dogsService.getDogs();
    }
}

