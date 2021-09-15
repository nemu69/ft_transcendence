import { Body, Controller, Param, Get, Res, Post, Request, Put, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { LoginResponseI } from '../model/login-response.interface';
import { UserI, UserRole } from '../model/user.interface';
import { map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserService } from '../service/user-service/user.service';
import { JwtAuthGuard } from '../../auth/login/guards/jwt.guard'
import { diskStorage } from 'multer';
import path = require('path');
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { RolesGuard } from 'src/auth/login/guards/roles.guards';
import { hasRoles } from 'src/auth/login/decorator/roles.decorator';

export const storage = {
  storage: diskStorage({
      destination: './src/uploads/avatar',
      filename: (req, file, cb) => {
          const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${extension}`)
      }
  })

}

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

  @Get('/find-by-level')
  async findAllByLevel() {	  
    return this.userService.findAllByLevel();
  }

  @Get(':id')
  async findOne(@Param() params): Promise<UserI>{    
	  return this.userService.findOne(params.id);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseI> {
    const userEntity: UserI = this.userHelperService.loginUserDtoToEntity(loginUserDto);
    const login = await this.userService.login(userEntity);
    let expiresIn = 10000;
    if (login.payload.twoFactorAuthEnabled)
      expiresIn = 30;
	return {
      access_token: login.jwt,
      token_type: 'JWT',
      expires_in: expiresIn,
	    two_factor: login.payload.twoFactorAuthEnabled,
      id: login.payload.id,
    };
  }
  
  @UseGuards(JwtAuthGuard)
  @Put('logout')
  async logout(@Body() user: UserI): Promise<any> {    
    return this.userService.logout(user);
  }
  
  @hasRoles(UserRole.ADMIN, UserRole.OWNER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id/role')
  async updateRoleOfUser(@Param('id') id: string, @Body() user: UserI): Promise<UserI> {
    return this.userService.updateRoleOfUser(Number(id), user);
  }
  
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateOne(@Param('id') id: string, @Body() user: UserI): Promise<any> {    
    return this.userService.updateOne(Number(id), user);
  }
  

  @UseGuards(JwtAuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Request() req): Observable<Object> {
        const user: UserI = req.user;
        return this.userService.updateOneOb(user.id, {avatar: file.filename}).pipe(
            tap((user: UserI) => console.log(user)),
            map((user: UserI) => ({avatar: user.avatar}))
        )
    }

	@Get('avatar/:imagename')
    findProfileImage(@Param('imagename') imagename, @Res() res): Observable<Object> {
        return of(res.sendFile(join(process.cwd(), 'src/uploads/avatar/' + imagename)));
    }

    @Get('avatarById/:id')
    async findProfileImageById(@Param('id') id, @Res() res): Promise<Object> {
        const user = await this.userService.findOne(id);
        console.log("avatar",user.avatar);
        
        return of(res.sendFile(join(process.cwd(), 'src/uploads/avatar/' + user.avatar)));
    }

}
