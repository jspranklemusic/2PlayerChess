# 2PlayerChess

A fullstack project.

A two-player real-time chess game with timer, rules, a game clock, and a chat. Built with vanilla JS, jQuery, Socket.io, Bootstrap, and express.
This is primarily a practice project, but it is fully functional, and will work with multiple players over the internet in real time.
There are still a few bugs, namely that you can only select a piece once. I am working on creating a second app in Vue.js with an AI computer as well.
Otherwise, about 95% bug-free. 

To get running, you need to start an express server to deliver the app. 

1. To start a game, create a room, and then you will automatically have a randomly-generated access code.
2. Share the access code, and anyone can join the game as long as there is an open spot.
3. You can select different time controls.
4. You can also offer a draw, resign, or leave the game, in which case a loading spinner will wait for reconnection.
5. If the server goes down, then the game will stop and progress will not be saved.

I will admit, although the code works, it is rather messy, and the JS code is embedded in the HTML, which causes more mess. 
I am working on a completely different version with Vue.js, the web workers API, and authentication with Google or Facebook
that will hopefully be slimmer and contain fewer bugs. 

Thanks for watching!


