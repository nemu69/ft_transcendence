import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Observable, from, of, throwError } from 'rxjs';
import { switchMap, map, catchError} from 'rxjs/operators';
import { UserEntity } from 'src/user/model/user.entity';
import { UserStatus } from 'src/user/model/user.interface';
import { UserService } from 'src/user/service/user-service/user.service';
import { getRepository, Like, Repository } from 'typeorm';
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

	async createMatchHistory(match: HistoryI): Promise<HistoryI>{
		try {
			const n_match = await this.historyRepository.save(this.historyRepository.create(match));
			return this.findOne(n_match.id);
		} catch {
			throw new HttpException('BLEBLEBLE', HttpStatus.CONFLICT);
		}
  	}

	async findOne(id: number): Promise<HistoryI> {
		return this.historyRepository.findOne({ id });
	}

	async findAll(options: IPaginationOptions): Promise<Pagination<HistoryI>> {
		return paginate<HistoryEntity>(this.historyRepository, options);
	}

	async findAllByUserId(id: number): Promise<HistoryEntity[] | undefined> {
		const match = await this.historyRepository
			.createQueryBuilder("h")
			.where("h.playerOne = :id OR h.playerTwo = :id")
			.take(5)
			.setParameters({ id: id })
			.orderBy('h.date', 'DESC')
			.getMany();

    	return match;
	}

	async findAllByUserIdAndType(id: number, type: string): Promise<HistoryEntity[] | undefined> {
		const match = await this.historyRepository
			.createQueryBuilder("h")
			.where("h.playerOne = :id OR h.playerTwo = :id AND h.game= :type")
			.take(5)
			.setParameters({ id: id, type: type })
			.orderBy('h.date', 'DESC')
			.getMany();

    	return match;
	}

}
