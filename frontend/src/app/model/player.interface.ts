import { CoordinatesI } from "./coordinates.interface";
import { UserI } from "./user/user.interface";

export interface PlayerI {
  user: UserI;
  socket: string;
  paddle: CoordinatesI;
}