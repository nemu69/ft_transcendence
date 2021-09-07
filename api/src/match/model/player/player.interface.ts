import { UserI } from "src/user/model/user.interface";
import { CoordinatesI } from "../coordinates/coordinates.interface";

export interface PlayerI {
  user: UserI;
  socket: string;
  paddle: CoordinatesI;
}