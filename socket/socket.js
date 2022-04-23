const { Server } = require("socket.io");
const User = require("../models/User");

function socketLogic(httpServer) {
    const io = new Server(httpServer);
    
    let playersReady = [];
    let gameSessions = [];
    
    io.on("connection", (socket) => {
        socket.on("disconnect", () => {
            let toRemove = playersReady.indexOf(socket.id);
    
            if(toRemove > -1) {
                playersReady.splice(toRemove, 1);
            }
        })
    
        socket.on("ready-to-play", () => {
            if(playersReady.length > 0) {
                const room = playersReady[0];
                socket.to(room).emit("start-game", {room, symbol: "O"});
                io.in(socket.id).emit("start-game", {room, symbol: "X"});
                gameSessions.push(room);
                playersReady.shift();
            }
            else {
                playersReady.push(socket.id);
            }
        })
    
        socket.on("start-game", (gameDetails) => {
            console.log("game started");
            console.log(playersReady);
            console.log(gameSessions);

            if(!gameDetails) return;
    
            const gameDataQuery = gameSessions.filter(session => session.gameId == gameDetails.gameId)[0];
    
            const gameData = gameDataQuery || {};
            
            if(gameData.player1) {
                gameData.player2 = gameDetails.gamerId;
                gameData.player2_symbol = gameDetails.symbol;
                gameData.player2_username = gameDetails.player_username;
            }
            else {
                gameData.player1 = gameDetails.gamerId;
                gameData.player1_symbol = gameDetails.symbol;
                gameData.player1_username = gameDetails.player_username;
            }
    
            gameData.board = ["", "", "", "", "", "", "", "", ""];
            gameData.current_player = gameData.player1;
            gameData.start_time = new Date().getTime();
    
            if(!gameDataQuery) {
                gameData.gameId = gameDetails.gameId;
                gameSessions.push(gameData);
            }
    
            socket.join(gameData.gameId)
    
            io.in(gameData.gameId).emit("player_play", gameData);
    
            //socket.on("player1_played")
            //play player 2;
    
            socket.on("player_played", (gameData) => {
                if(checkWin(gameData.board)) {
                    io.in(gameData.gameId).emit("player_won", gameData);
                    deleteSession(gameData);
                    return;
                }
    
                if(checkTie(gameData.board)) {
                    io.in(gameData.gameId).emit("tie_in_game", gameData);
                    deleteSession(gameData);
                    return;
                }
    
                if(gameData.current_player == gameData.player1) {
                    gameData.current_player = gameData.player2;
                }
                else {
                    gameData.current_player = gameData.player1;
                }
    
                gameData.start_time = new Date().getTime();
                io.in(gameData.gameId).emit("player_play", gameData);
            })

            io.of("/").adapter.on("leave-room", (room, id) => {
                if(room == gameData.gameId) {
                    io.in(gameData.gameId).emit("player_left", gameData);
                    deleteSession(gameData);

                    let playerLeft = (gameData.player1 == id) ? gameData.player1_username : gameData.player2_username;

                    User.findOne({username: playerLeft})
                    .then((user) => {
                        if(!user) return;

                        if(user.last_game == gameData.gameId) return;

                        user.total_matches_played++;

                        user.save();
                    })
                }
            })
        })

        socket.on("game-finished", (scoreDetails) => {
            User.findOne({username: scoreDetails.username})
            .then((user) => {
                if(user == null) {
                    return;
                }

                if(user.last_game == scoreDetails.gameId) return;

                user.score += scoreDetails.score;
                user.last_game = scoreDetails.gameId;
                user.total_matches_played++;
                user.total_matches_won += scoreDetails.match_won;
                user.save()
            })
        })
    })
    
    function checkWin(board) {
        let winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]
    
        for(let i=0; i<winningCombinations.length; i++) {
            let combination = winningCombinations[i];
    
            if(board[combination[0]] && board[combination[0]] == board[combination[1]] && board[combination[1]] == board[combination[2]]) {
                return true;
            }
        }
    
        return false;
    }
    
    function checkTie(board) {
        for(let i=0; i<9; i++) {
            if(!board[i]) return false;
        }
        return true;
    }
    
    function deleteSession(gameData) {
        gameSessions = gameSessions.filter(gameSession => gameSession.gameId != gameData.gameId);
        gameSessions = gameSessions.filter(gameSession => gameSession != gameData.gameId);
    }
}


module.exports = socketLogic;