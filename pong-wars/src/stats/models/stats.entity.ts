import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StatsEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    label: string;
    
    // @OneToMany(() => UsersEntity)
    // @JoinColumn()
    // users: UsersEntity;

}