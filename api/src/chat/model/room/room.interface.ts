import { UserI } from "src/user/model/user.interface";

export interface RoomI {
  id?: number;
  name?: string;
  description?: string;
  users?: UserI[];
  admin?: UserI[];
  owner?: UserI;
  created_at?: Date;
  updated_at?: Date;
}
