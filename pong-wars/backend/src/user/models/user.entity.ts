import { BeforeInsert, Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole, UserStatus } from "./user.interface";

@Entity()
export class UserEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column()
    avatar: string;
    
    @Column()
    level: number;

    @OneToMany(() => UserEntity, user => user.id)
    @JoinColumn()
    friend: UserEntity[];
    
    @Column({type: 'enum', enum: UserStatus, default: UserStatus.OFF})
    status: UserStatus;

    @Column({type: 'enum', enum: UserRole, default: UserRole.USER})
    role: UserRole;

	@BeforeInsert()
	emailToLowerCase() {
		this.email = this.email.toLocaleLowerCase();
	}
}