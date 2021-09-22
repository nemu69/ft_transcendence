import { UserEntity } from "src/user/model/user.entity";

export interface HistoryI {
  id?: number;
  playerOne?: UserEntity;
  playerTwo?: UserEntity;
  playerOneScore?: number;
  playerTwoScore?: number;
  game?: string;
  date?: Date;
}