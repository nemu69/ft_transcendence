import { FriendEntity } from "src/friend/models/friend.entity";
import { StatsEntity } from "src/stats/models/stats.entity";
import { StatusEntity } from "src/status/models/status.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    password: string;

    @Column()
    email: string;

    @Column()
    avatar: string;
    
    @ManyToOne(() => StatsEntity)
    @JoinColumn()
    stats: StatsEntity;

    @OneToOne(() => FriendEntity)
    @JoinColumn()
    friend: FriendEntity;

    @ManyToOne(() => StatusEntity)
    @JoinColumn()
    status: StatusEntity;

}