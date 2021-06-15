import { UserEntity } from "src/user/models/user.entity";
import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StatsEntity {

    @PrimaryGeneratedColumn()
    label: string;
    
    @OneToMany(() => UserEntity, user => user.id)
    @JoinColumn()
    users: UserEntity[];

}