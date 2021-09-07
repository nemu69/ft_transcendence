import { Body, Controller, Param, Get, Res, Post, Put, Query, Req, SerializeOptions, UseGuards } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { UserI } from '../model/user.interface';
import { Response } from 'express';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserService } from '../service/user-service/user.service';
import { JwtAuthGuard } from '../../auth/login/guards/jwt.guard'


@Controller('users')
export class UserController {

  constructor(
    private userService: UserService,
    private userHelperService: UserHelperService,
  ) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserI> {
    const userEntity: UserI = this.userHelperService.createUserDtoToEntity(createUserDto);
    return this.userService.create(userEntity);
  }

  @Get()
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<Pagination<UserI>> {
    limit = limit > 100 ? 100 : limit;
    return this.userService.findAll({ page, limit, route: 'http://localhost:3000/api/users' });
  }

  @Get('/find-by-username')
  async findAllByUsername(@Query('username') username: string) {	  
    return this.userService.findAllByUsername(username);
  }

  @Get(':id')
  async findOne(@Param() params): Promise<UserI>{
	  return this.userService.findOne(params.id);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseI> {
    const userEntity: UserI = this.userHelperService.loginUserDtoToEntity(loginUserDto);
    const login = await this.userService.login(userEntity);	
	return {
      access_token: login.jwt,
      token_type: 'JWT',
      expires_in: 10000,
	  two_factor: login.payload.twoFactorAuthEnabled
    };
  }

//  @UseGuards(JwtTwoFactorGuard)
  @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateOne(@Param('id') id: string, @Body() user: UserI): Promise<any> {
        return this.userService.updateOne(Number(id), user);
    }

}
