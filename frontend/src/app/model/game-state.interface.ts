import { PlayerI } from "./player.interface";
import { CoordinatesI } from "./coordinates.interface";
import { UserI } from "./user/user.interface";

export interface GameStateI {
    id?: number;
    socketId: string;
    player1: PlayerI;
    player2: PlayerI;
    spectators: UserI[];
    ball: CoordinatesI;
}