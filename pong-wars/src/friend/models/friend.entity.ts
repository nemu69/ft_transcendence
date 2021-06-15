import { UserEntity } from "src/user/models/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FriendEntity {
    
    @PrimaryGeneratedColumn()
    @OneToOne(() => UserEntity)
    @JoinColumn()
    user: UserEntity;

    @OneToMany(() => UserEntity, user => user.id)
    @JoinColumn()
    friend: UserEntity[];

}