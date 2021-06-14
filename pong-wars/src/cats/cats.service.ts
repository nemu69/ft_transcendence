import { Injectable } from '@nestjs/common';
import { CATS } from './cats.mock';

@Injectable()
export class CatsService {
    private cats = CATS;

    public async getCats() {
        return this.cats;
    }
}
