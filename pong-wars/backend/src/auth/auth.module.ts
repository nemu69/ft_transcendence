import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';

@Module({
	imports: [
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: process.env.JWT_SECRET,
				signOptions: {expiresIn: '10000s'}
			})
		})
	],
	providers: [AuthService],
	exports: [AuthService]
})

export class AuthModule {}
