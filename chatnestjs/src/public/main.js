const SAD_EMOJI = [55357, 56864];
const HAPPY_EMOJI = [55357, 56832];
const NEUTRAL_EMOJI = [55357, 56848];

new Vue({
    el: '#app',
    data: {
        chats: [],
        username: "",
        mood: ''
    },
    created() {
        let pusher = new Pusher('31a362f5accab65645a7', {
            cluster: 'eu',
            encrypted: true
        });
        
        const channel = pusher.subscribe('chats');
        channel.bind('new-chat', data => {
            const expression = data.sentiment > 0 ? HAPPY_EMOJI : (data.sentiment === 0 ? NEUTRAL_EMOJI : SAD_EMOJI);

            const response = {
                message: data.message,
                user: data.user,
                mood: String.fromCodePoint(...expression)
            }

            this.chats.push(response);
        });
    },
    methods: {
        getUser(event) {
            this.username = event.target.value;
        },
        
        postMessages(event) {
            const chatMessage = event.target.value;
            
            if(event.keyCode === 13 && !event.shiftKey) {
                const chat = {
                    user: this.username,
                    message: chatMessage
                };
                
                event.target.value = "";
                
                axios.post('/message', chat)
                .then( data => {
                    console.log(data);
                });
            }
        }
    }
})
