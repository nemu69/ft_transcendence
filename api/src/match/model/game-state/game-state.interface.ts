import { PlayerI } from "../player/player.interface";
import { CoordinatesI } from "../coordinates/coordinates.interface";
import { UserI } from "src/user/model/user.interface";

export interface GameStateI {
    id?: number;
    socketId: string;
    player1: PlayerI;
    player2: PlayerI;
    spectators: UserI[];
    ball: CoordinatesI;
}