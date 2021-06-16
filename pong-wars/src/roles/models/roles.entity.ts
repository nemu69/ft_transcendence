import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RolesEntity {
    
    @PrimaryGeneratedColumn()
    label: string;

}