import { UserEntity } from "src/user/models/user.entity";
import { Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StatusEntity {
    
    @PrimaryGeneratedColumn()
    label: string;

    @OneToMany(() => UserEntity, user=> user.id)
    @JoinColumn()
    users: UserEntity[];

}