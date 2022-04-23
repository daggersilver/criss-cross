const gameGrid = document.getElementById("game-grid");
const messageBox = document.getElementById("message-box");
const timeLeftBar = document.getElementById("time-left-bar-inner");
const gridTiles = [];
const markedGrids = [];
let markImage = null;
let markImageLight = null;
let playerPlay = false;
let currGameData = null;

//constants
const WIN_SCORE = 20;
const LOST_SCORE = 0;
const TIE_SCORE = 10;

for(let i=0; i<9; i++) {
    let div = document.createElement("div");
    div.setAttribute("data-grid-no", i);
    div.className = "grid-tiles";
    gridTiles.push(div);
    markedGrids.push(false);
    gameGrid.appendChild(div);

    // div(data-grid-no="1" class="grid-tiles") X
    //             div(data-grid-no="2" class="grid-tiles") O
    //             div(data-grid-no="3" class="grid-tiles") 
    //                 i(class="fa-solid fa-xmark")
    //             div(data-grid-no="4" class="grid-tiles")
    //                 i(class="fa-solid fa-x")
    //             div(data-grid-no="5" class="grid-tiles")
    //                 img(src="/assets/grid-O.svg")
    //             div(data-grid-no="6" class="grid-tiles")
    //             div(data-grid-no="7" class="grid-tiles")
    //             div(data-grid-no="8" class="grid-tiles")
    //             div(data-grid-no="9" class="grid-tiles")
}

const socket = io();

socket.on("connect", () => {  
    const urlToken = window.location.href.split("/game/")[1].split("/")[0].split("?");
    const gameId = urlToken[0];
    const playerSymbol = urlToken[1];
    let timeLeft;
    
    markImage = `/assets/grid-${playerSymbol}.svg`;
    markImageLight = `/assets/grid-${playerSymbol}-light.svg`;

    socket.emit("start-game", {
        gamerId: socket.id,
        gameId,
        symbol: playerSymbol,
        player_username: document.getElementById("username-details").getAttribute("data-username")
    });

    socket.on("player_play", (gameData) => {
        if(!gameData.player1 || !gameData.player2) return;

        if(gameData.current_player == socket.id) {
            playerPlay = true;
            messageBox.innerText = "Your turn";
        }
        else {
            playerPlay = false;
            messageBox.innerText = (gameData.player1 == socket.id ? gameData.player2_username : gameData.player1_username) + "'s turn";
        }

        timeLeftBar.style.width =  "1%"
        let startTime = gameData.start_time;
        clearInterval(timeLeft);
        
        currGameData = gameData;
        updateBoard(currGameData.board);

        timeLeft = setInterval(() => {
            let interval = Math.floor((new Date().getTime() - startTime) / 300);
            
            let currTime = parseInt(timeLeftBar.style.width.split("%")[0]);

            if(currTime > 100) {
                playerPlay = false;
                socket.emit("player_played", currGameData);
                clearInterval(timeLeft);
                timeLeftBar.style.width =  "1%"
            }

            timeLeftBar.style.width = interval + "%";
        }, 50)

    })

    socket.on("player_won", (gameData) => {
        playerPlay = false;
        clearInterval(timeLeft);
        updateBoard(gameData.board);

        let you, other;
        if(socket.id == gameData.player1) {
            you = gameData.player1_username;
            other = gameData.player2_username;
        }
        else {
            you = gameData.player2_username;
            other = gameData.player1_username;
        }

        if(gameData.current_player == socket.id) {
            messageBox.innerText = "You Won 😁!!";
            showResults(you, WIN_SCORE, other, LOST_SCORE);
            gameFinished(socket, you, WIN_SCORE, gameData.gameId);
        }
        else {
            messageBox.innerText = "You lost 😟!!";
            showResults(you, LOST_SCORE, other, WIN_SCORE);
            gameFinished(socket, you, LOST_SCORE, gameData.gameId);
        }

    })

    socket.on("tie_in_game", (gameData) => {
        playerPlay = false;
        clearInterval(timeLeft);
        updateBoard(gameData.board);

        messageBox.innerText = "Tie";
        showResults(gameData.player1_username, TIE_SCORE, gameData.player2_username, TIE_SCORE);

        gameFinished(socket, 
            document.getElementById("username-details").getAttribute("data-username"),
            TIE_SCORE,
            gameData.gameId);
    })

    socket.on("player_left", (gameData) => {
        const playerLeft = (gameData.player1 == socket.id) ? gameData.player2_username : gameData.player1_username;
        const you = (gameData.player1_username == playerLeft) ? gameData.player2_username : gameData.player1_username;
        messageBox.innerText = playerLeft + " left";

        playerPlay = false;
        clearInterval(timeLeft);
        updateBoard(gameData.board);

        showResults(you, WIN_SCORE, playerLeft, LOST_SCORE);

        gameFinished(socket, you, WIN_SCORE, gameData.gameId);
    })

    gridTiles.forEach(gridTile => {
        
        gridTile.addEventListener("click", (e) => {
            if(canMark(e)) {
                clearInterval(timeLeft);

                markedGrids[e.target.getAttribute("data-grid-no")] = true;
                gridTile.style.backgroundImage = `url(${markImage})`;

                currGameData.board[e.target.getAttribute("data-grid-no")] = playerSymbol;
                playerPlay = false;
                updateBoard(currGameData.board)

                socket.emit("player_played", currGameData);
            }
        });

        gridTile.addEventListener("mouseenter", (e) => {
            if (!canMark(e)) {
                return;
            }

            gridTile.style.backgroundImage = `url(${markImageLight})`;
        })

        gridTile.addEventListener("mouseleave", (e) => {
            if (canUnmark(e)) {
                gridTile.style.backgroundImage = "none";
            }
        })
    })
})

function gameFinished(socket, username, score, gameId) {
    let scoreDetails = {
        username, score, gameId
    }

    if(score < WIN_SCORE) {
        scoreDetails.match_won = 0;
    }
    else {
        scoreDetails.match_won = 1;
    }

    socket.emit("game-finished", scoreDetails);
}

function showResults(yourName, yourScore, otherName, otherScore) {
    const resultBox = document.getElementById("result-box");
    const player1Score = document.getElementById("player1-score");
    const player2Score = document.getElementById("player2-score");
    const verdict = document.getElementById("game-verdict");

    player1Score.innerText = otherName + " : " + otherScore + " xp";
    player2Score.innerText = yourName + " : " + yourScore + " xp";

    if(yourScore == otherScore) {
        verdict.innerText = "result: tie";
    }
    else if(yourScore > otherScore) {
        verdict.innerText = "result: you won";
    }
    else {
        verdict.innerText = "result: you lost";
    }

    resultBox.style.display = "block";
}

function canMark(e) {
    if(!playerPlay) return false;

    if(!currGameData) return false

    return !markedGrids[e.target.getAttribute("data-grid-no")]
}

function canUnmark(e) {
    return !markedGrids[e.target.getAttribute("data-grid-no")]
}

function updateBoard(newBoard) {

    for(let i=0; i<9; i++) {
        if(newBoard[i] == "O" || newBoard[i] == "X") {
            gridTiles[i].style.backgroundImage = `url("/assets/grid-${newBoard[i]}.svg")`;
            
            markedGrids[i] = true;
        }
    }
}