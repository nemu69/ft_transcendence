import { Injectable } from '@nestjs/common';

@Injectable()
export class DogsService {
    public async getDogs(){
        return("WOOF");
    }
}
