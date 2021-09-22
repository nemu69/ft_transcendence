import { PlayerI } from "../player/player.interface";
import { CoordinatesI } from "../coordinates/coordinates.interface";
import { UserService } from "src/user/service/user-service/user.service";
import { PowerI } from "../powers/powers.interface";

export interface GameStateI {
    userServices?: UserService;
    id?: NodeJS.Timeout;
    player1: PlayerI;
    player2: PlayerI;
    spectators?: PlayerI[];
    ball: CoordinatesI;
    type: number;
    powers?: PowerI[];
}