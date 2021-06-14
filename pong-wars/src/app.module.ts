import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CatsController } from './cats/cats.controller';
import { CatsModule } from './cats/cats.module';
import { CatsService } from './cats/cats.service';
import { DogsModule } from './dogs/dogs.module';
import { DogsController } from './dogs/dogs.controller';
import { DogsService } from './dogs/dogs.service';


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
    CatsModule,
    DogsModule
  ],
  controllers: [AppController, CatsController, DogsController],
  providers: [AppService, CatsService, DogsService],
})
export class AppModule {}
