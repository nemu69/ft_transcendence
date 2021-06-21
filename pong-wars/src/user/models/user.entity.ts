import { FriendEntity } from "src/friend/models/friend.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
    
    @Column()
    level: number;

    @OneToOne(() => FriendEntity)
    @JoinColumn()
    friend: FriendEntity;
    
    @Column()
    status: string;

    @Column()
    role: string;
}