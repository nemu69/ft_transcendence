import { StatsEntity } from "src/stats/models/stats.entity";

export interface UserI {
    id: number;
    name: string;
    password: string;
    email: string;
    avatar: string;
    stats: StatsEntity;
}