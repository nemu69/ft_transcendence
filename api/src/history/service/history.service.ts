import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, map, catchError} from 'rxjs/operators';
import { UserEntity } from 'src/user/model/user.entity';
import { Repository } from 'typeorm';
import { HistoryEntity } from '../model/history.entity';
import { HistoryI } from '../model/history.interface';


@Injectable()
export class HistoryService {

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(HistoryEntity)
    private readonly historyRepository: Repository<HistoryEntity>,
  ) { }

  findUserById(id: number): Observable<UserEntity> {
    return from(
      this.userRepository.findOne({ id }),
    ).pipe(
      map((user: UserEntity) => {
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        delete user.password;
        return user;
      }),
    );
  }

  createMatchHistory(match: HistoryI): Observable<HistoryEntity> {
	return from(this.historyRepository.save(match));
  }

}
