import { StatsEntity } from "src/stats/models/stats.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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

}