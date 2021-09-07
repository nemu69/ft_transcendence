import { HostListener, AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith, tap } from 'rxjs/operators';
import { GameStateI } from 'src/app/model/game-state.interface';
import { MessagePaginateI } from 'src/app/model/chat/message.interface';
import { RoomI } from 'src/app/model//chat/room.interface';
import { ChatService } from '../../services/chat-service/chat.service';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  initialized: boolean = false;
  constructor(private chatService: ChatService, private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        if (this.initialized == true)
        {
          this.initialized = false;
          this.chatService.PlayerExit();
        }
      }

      if (event instanceof NavigationEnd) {
        
      }

      if (event instanceof NavigationError) {
        //this.chatService.PlayerExit();
      }
    });
  }

  gamestate$: Observable<GameStateI> = this.chatService.getGameState();
  myObserver = {
    next: (x: GameStateI) => console.log("ble" + x),
    error: (err: Error) => console.error('Observer got an error: ' + err),
    complete: () => console.log('Observer got a complete notification'),
  };

  resize_canvas(){
    this.gamestate$.subscribe(this.myObserver);
    var canvas = document.getElementById("game");
    if (canvas && canvas instanceof HTMLCanvasElement)
    {
      canvas.height = window.innerHeight - 100;
      canvas.width  = window.innerWidth - 100;
      console.log("HEIGHT =" + canvas.height)
      console.log("WIDTH =" + canvas.width)
    }
  }

  ngOnInit(){
    let ble = this.gamestate$;
    this.chatService.newPlayer();
    this.initialized = true;
    this.resize_canvas();
    window.addEventListener('resize', this.resize_canvas, false);
    let chatService2: ChatService = this.chatService;    
    //private chatService: ChatService
    document.addEventListener('keydown', function(e) {
        
      // up arrow key
      if (e.key === "ArrowUp")
        chatService2.emitInput(-1);
      else if (e.key === "ArrowDown") {
        chatService2.emitInput(1);
      }
    });
    this.gamestate$.subscribe(this.myObserver);
    // listen to keyboard events to stop the paddle if key is released
    document.addEventListener('keyup', function(e) {
      console.log(ble);
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        chatService2.emitInput(0);
        console.log("BLE");
      }
    });
  }
}
