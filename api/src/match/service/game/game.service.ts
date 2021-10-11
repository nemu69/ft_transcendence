import { Injectable } from '@nestjs/common';
import { LobbyI } from 'src/match/model/lobby/lobby.interface';
import { Socket, Server } from 'socket.io';
import { UserI} from 'src/user/model/user.interface';
import { CoordinatesI } from 'src/match/model/coordinates/coordinates.interface';
import { GameStateI } from 'src/match/model/game-state/game-state.interface';
import { PowerI } from 'src/match/model/powers/powers.interface';


@Injectable()
export class GameService {

  constructor(){};

  //Respawn ball with random angle but always towards the side that lost last
  public RespawnBall(ball: CoordinatesI, side: number)
  {
    //reset ball position
    ball.speedmultiplier = 2;
    ball.x = 200 - ball.width/2;
    ball.y = 150 - ball.height/2;
    ball.dx = 10 * side;
    ball.dy = Math.random() * 20 - 10;
    //reset magnitude of ball to speed multiplier
    let magnitude: number = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2));
    ball.dx = ball.dx / magnitude * ball.speedmultiplier;
    ball.dy = ball.dy / magnitude * ball.speedmultiplier;
  }
  
  //calculate Bounces from paddles based on relative positions of both objects
  public CalculateBounce(ball: CoordinatesI, paddle: CoordinatesI)
  {
    ball.speedmultiplier *= 1.05;
    ball.dx  = -Math.sign(ball.dx) * 10;
    ball.dy = ((ball.y + ball.height) - (paddle.y + paddle.height/2))/2;
    if (Math.abs(ball.dx) < Math.abs(ball.dy) / 3)
      ball.dx = Math.abs(ball.dy) / 3 * Math.sign(ball.dx);
    if (Math.abs(ball.dy) < 0.5)
      ball.dy = 0;
    let magnitude: number = Math.sqrt(Math.pow(ball.dx, 2) + Math.pow(ball.dy, 2));
    ball.dx = ball.dx / magnitude * ball.speedmultiplier;
    ball.dy = ball.dy / magnitude * ball.speedmultiplier;
    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    if (paddle.x < 200)
      ball.x = paddle.x + paddle.width;
    else
      ball.x = paddle.x - paddle.width;
  }

  //simple function to check collisions between to CoordinatesI interfaces
  public collides(obj1: CoordinatesI, obj2: CoordinatesI) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
  }

  //Randomly Spawn A powerup on the map
  public spawnPowerUp(gamestate: GameStateI)
  {
    //PowerUp that reduces opponent's pallet size
    //Duration and effect setup with stat reset on deactivation
    let SmallerRacket: PowerI = {
      pos: {
        x: 50 + Math.random() * 300,
        y: 20 + Math.random() * 260,
        width: 10,
        height: 10,
      },
      color: "red",
      duration: 5,
      player: -1,
      activate: function (n_player: number) {
        if (n_player == 0)
          gamestate.player2.paddle.height -= 20;
        else
          gamestate.player1.paddle.height -= 20;
      },
      deactivate: function (n_player: number) {
        if (n_player == 0)
          gamestate.player2.paddle.height += 20;
        else
          gamestate.player1.paddle.height += 20;
      }
    }
    //PowerUp that increase player's pallet size
    //Duration and effect setup with stat reset on deactivation
    let BiggerRacket: PowerI = {
      pos: {
        x: 50 + Math.random() * 300,
        y: 20 + Math.random() * 260,
        width: 10,
        height: 10,
      },
      color: "green",
      duration: 5,
      player: -1,
      activate: function (n_player: number) {
        if (n_player == 0)
          gamestate.player1.paddle.height += 20;
        else
          gamestate.player2.paddle.height += 20;
      },
      deactivate: function (n_player: number) {
        if (n_player == 0)
          gamestate.player1.paddle.height -= 20;
        else
          gamestate.player2.paddle.height -= 20;
      }
    }
    //Randomly select one of the powerups to be generated
    let i: number = Math.floor(Math.random() * 2);
    if (i == 0)
      gamestate.powers.push(SmallerRacket);
    else if (i == 1)
      gamestate.powers.push(BiggerRacket);
  }

  //Update Currently in use powerups and call deactivate if duration reaches 0 bounces
  public updatePowerUp(gamestate: GameStateI)
  {
    let i: number = 0;
    gamestate.powers.forEach(power => {
      if (power.player != -1)
      {
        power.duration--;
        if (power.duration < 1)
        {
          power.deactivate(power.player);
          gamestate.powers.splice(i, 1);
        }
      }
      i++;
    });
  }

}
