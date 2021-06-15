import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class StatusEntity {
    
    @PrimaryGeneratedColumn()
    label: string;

}