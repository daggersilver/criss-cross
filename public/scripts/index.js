
const playBtn = document.getElementById("play-btn");
const waitingScreen = document.getElementById("waiting-screen");

const socket = io();

socket.on("connect", () => {  
    console.log(socket.id); 
})

playBtn.addEventListener("click", () => {
    playBtn.disabled = true;

    socket.emit("ready-to-play");

    waitingScreen.style.display = "block";

    socket.on("start-game", ({room, symbol}) => {
        window.location = "/game/" + room + "?" + symbol ;
    })
})


