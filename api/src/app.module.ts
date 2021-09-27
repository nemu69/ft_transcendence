import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true
    }),
    UserModule,
    AuthModule,
    ChatModule,
    FriendsModule,
	HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        {path: '/api/users', method: RequestMethod.POST},
        {path: '/api/users/:id', method: RequestMethod.GET},
        {path: '/api/users/login', method: RequestMethod.POST},
        {path: '/api/users/logout', method: RequestMethod.POST},
        {path: '/api/users/upload', method: RequestMethod.POST},
        {path: '/api/users/:id/role', method: RequestMethod.PUT},
        {path: '/api/users/avatarById/:id', method: RequestMethod.GET},
		    //
		    {path: '/api/friend/friend-request/send/:receiverId', method: RequestMethod.POST},
		    {path: '/api/friend/friend-request/status/:receiverId', method: RequestMethod.GET},
		    {path: '/api/friend/friend-request/response/:friendRequestId', method: RequestMethod.PUT},
		    {path: '/api/friend/friend-request/me/received-requests', method: RequestMethod.GET},
		    //
        {path: '/api/2fa/generate', method: RequestMethod.POST},
        {path: '/api/2fa/authenticate', method: RequestMethod.POST},
        {path: '/api/2fa/turn-on', method: RequestMethod.POST},
        {path: '/api/2fa/turn-off', method: RequestMethod.POST},
        {path: '/api/2fa/secret', method: RequestMethod.GET},
        {path: '/api/2fa/qrcode', method: RequestMethod.GET},
		    //
        {path: '/api/oauth2/school42', method: RequestMethod.GET},
        {path: '/api/oauth2/school42/callback', method: RequestMethod.GET},
        {path: '/api/history', method: RequestMethod.GET},
        {path: '/api/history/match/:id', method: RequestMethod.GET},
      )
      .forRoutes('')
  }
}