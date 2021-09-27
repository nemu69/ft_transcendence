import { UserEntity } from 'src/user/model/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('request')
export class HistoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.host)
  playerOne: UserEntity;

  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.opponent,
  )
  playerTwo: UserEntity;

  @Column()
  playerOneScore: number;

  @Column()
  playerTwoScore: number;

  @Column()
  game: string;

  @CreateDateColumn()
  date: Date;
}