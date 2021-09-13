import { Body, Controller, Param, Get, Res, Post, Put, Query, Req, SerializeOptions, UseGuards } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/login/guards/jwt.guard'
import { FriendsI } from '../model/friends.interface';
import { FriendsService } from '../service/friends.service';


@Controller('users')
export class FriendsController {

  constructor(
    private FriendService: FriendsService,
  ) { }


}
