import { Component } from '@nestjs/common';


const Sentiment = require('sentiment');

@Component()
export class ChatService {
    
    addMessage(data) {
        const Pusher = require('pusher');
        const sentiment = new Sentiment();
        const sentimentScore = sentiment.analyze(data.message).score;

        const chat = {
            user: data.user,
            message: data.message,
            sentiment: sentimentScore
        }

        var pusher = new Pusher({
            appId: '1219936',
            key: '31a362f5accab65645a7',
            secret: '0e67d406668ffeb07915',
            cluster: 'eu',
            encrypted: true
          });

          pusher.trigger('chats', 'new-chat', chat);
    }
}