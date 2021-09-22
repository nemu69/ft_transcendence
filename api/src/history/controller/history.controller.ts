import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/login/guards/jwt.guard';
import { HistoryEntity } from '../model/history.entity';
import { HistoryI } from '../model/history.interface';
import { HistoryService } from '../service/history.service';


@Controller('history')
export class HistoryController {

	constructor(
		private historyService: HistoryService,
	) { }

  	@Post()
	add(@Body() match: HistoryI): Observable<HistoryEntity> {
		return this.historyService.createMatchHistory(match);
	}
}
