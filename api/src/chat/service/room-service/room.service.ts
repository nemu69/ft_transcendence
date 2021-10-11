import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Observable, of } from 'rxjs';
import { AuthService } from 'src/auth/login/service/auth.service';
import { RoomEntity } from 'src/chat/model/room/room.entity';
import { RoomI } from 'src/chat/model/room/room.interface';
import { UserI } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class RoomService {


  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepository: Repository<RoomEntity>,
	private authService: AuthService
  ) { }

  async createRoom(room: RoomI, creator: UserI): Promise<RoomI> {
	if (room.password) {
		const passwordHash: string = await this.hashPassword(room.password);
		room.password = passwordHash;
	}
	room.owner = creator;
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepository.save(newRoom);
  }

  async changePasswordRoom(room: RoomI, newPassword: string): Promise<RoomI> {
	  if (newPassword) {
		const passwordHash: string = await this.hashPassword(newPassword);
		room.password = passwordHash;
	}
    return this.roomRepository.save(room);
  }

  async getRoom(roomId: number): Promise<RoomI> {
    return this.roomRepository.findOne(roomId, {
      relations: ['users']
    });
  }

  async getRoomsForUser(userId: number, options: IPaginationOptions): Promise<Pagination<RoomI>> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .where('users.id = :userId', { userId })
      .leftJoinAndSelect('room.users', 'all_users')
      .orderBy('room.updated_at', 'DESC');

    return paginate(query, options);
  }

  async getAllRoom(options: IPaginationOptions): Promise<Pagination<RoomI>> {
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.users', 'users')
      .leftJoinAndSelect('room.users', 'all_users')
	  .where('room.type != "private"')
      .orderBy('room.updated_at', 'DESC');

    return paginate(query, options);
  }

  async addUserToRoom(room: RoomI, user: UserI, password: string): Promise<Observable<{ error: string } | { success: string }>> {
	  if (room.type == 'private') return of({ error: 'Can\'t join private room;' }); 
	  if (room.type == 'public') {
			const newRoom = await this.addCreatorToRoom(room, user);
			this.roomRepository.save(newRoom);
			return of({ success: 'Room joined;' }); 
	  }
		if (room.type == 'protected') {
			const matches: boolean = await this.validatePassword(password, room.password);
			if (matches) {
				const newRoom = await this.addCreatorToRoom(room, user);
		  		this.roomRepository.save(newRoom);
				return of({ success: 'Room joined;' }); 
			}
			return of({ error: 'Bad password;' }); 
  		}
	}

  async addCreatorToRoom(room: RoomI, creator: UserI): Promise<RoomI> {
    room.users.push(creator);
    return room;
  }

  async addAdminToRoom(room: RoomI, user: UserI): Promise<RoomI> {
    room.admin.push(user);
    return room;
  }

  private async hashPassword(password: string): Promise<string> {
		return this.authService.hashPassword(password);
	}

	private async validatePassword(password: string, storedPasswordHash: string): Promise<any> {
		return this.authService.comparePasswords(password, storedPasswordHash);
	}

  async deleteAUserFromRoom(roomId: number, userId: number): Promise<RoomI> {
	const room = await this.getRoom(roomId);
	room.users = room.users.filter(user => user.id !== userId);
	console.log("without : ",room);
	
	return this.roomRepository.save(room);
  }

}
