const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'ludo-super-secret-key';
const PORT = process.env.PORT || 3000;

// Mock database models in memory
const usersDb = [];
const activeRooms = {}; // Room state

// Basic REST routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: usersDb.length + 1, username, password: hashedPassword, xp: 0, coins: 150, level: 1 };
        usersDb.push(newUser);
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = usersDb.find(u => u.username === username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { username: user.username, xp: user.xp, coins: user.coins, level: user.level } });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/leaderboards', (req, res) => {
    // Return mock rankings sorting user XP
    const rankings = [...usersDb]
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10)
        .map(u => ({ username: u.username, xp: u.xp, level: u.level }));
    res.json(rankings);
});

// Real-Time Socket.IO Game Lobby loop
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('authenticate', (token) => {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            socket.userId = decoded.userId;
            socket.username = decoded.username;
            console.log(`Authenticated socket ${socket.id} as User: ${socket.username}`);
        } catch (err) {
            socket.emit('auth_error', 'Invalid token');
        }
    });

    socket.on('create_room', (data) => {
        const roomId = 'LUDO-' + Math.floor(1000 + Math.random() * 9000);
        const playerLimit = parseInt(data.maxPlayers) || 4;
        socket.username = data.username || 'HostPlayer';
        
        activeRooms[roomId] = {
            id: roomId,
            players: [{ id: socket.id, name: socket.username, color: 'red', isHost: true, isBot: false }],
            maxPlayers: playerLimit,
            gameState: 'lobby',
            turnIdx: 0,
            diceRoll: null
        };
        socket.join(roomId);
        socket.roomId = roomId;
        socket.emit('room_created', activeRooms[roomId]);
    });

    socket.on('join_room', (data) => {
        const roomId = data.roomId;
        const room = activeRooms[roomId];
        if (!room) {
            return socket.emit('join_error', 'Room Not Found');
        }
        if (room.gameState !== 'lobby') {
            return socket.emit('join_error', 'Game Already Started');
        }
        if (room.players.length >= room.maxPlayers) {
            return socket.emit('join_error', 'Room Full');
        }

        socket.username = data.username || ('Player_' + (room.players.length + 1));
        
        // Auto-assign first available color
        const takenColors = room.players.map(p => p.color);
        const colors = ['red', 'green', 'yellow', 'blue'];
        const assignedColor = colors.find(c => !takenColors.includes(c)) || 'blue';
        
        room.players.push({ 
            id: socket.id, 
            name: socket.username, 
            color: assignedColor,
            isHost: false,
            isBot: false
        });
        
        socket.join(roomId);
        socket.roomId = roomId;
        io.to(roomId).emit('room_updated', room);
    });

    socket.on('select_color', (color) => {
        const room = activeRooms[socket.roomId];
        if (room && room.gameState === 'lobby') {
            const isTaken = room.players.some(p => p.color === color && p.id !== socket.id);
            if (!isTaken) {
                const player = room.players.find(p => p.id === socket.id);
                if (player) {
                    player.color = color;
                    io.to(socket.roomId).emit('room_updated', room);
                }
            }
        }
    });

    socket.on('start_game', () => {
        const room = activeRooms[socket.roomId];
        if (room && room.gameState === 'lobby') {
            const player = room.players.find(p => p.id === socket.id);
            if (player && player.isHost && room.players.length === room.maxPlayers) {
                room.gameState = 'playing';
                io.to(socket.roomId).emit('match_started', room);
            }
        }
    });

    socket.on('game_action_roll', (data) => {
        if (socket.roomId) {
            io.to(socket.roomId).emit('game_dice_rolled', { color: data.color, value: data.value });
        }
    });

    socket.on('game_action_move', (data) => {
        if (socket.roomId) {
            io.to(socket.roomId).emit('game_token_moved', data);
        }
    });

    socket.on('game_action_pass', (data) => {
        if (socket.roomId) {
            io.to(socket.roomId).emit('game_turn_passed', { nextPlayerIdx: data.nextPlayerIdx });
        }
    });

    socket.on('send_chat', (msg) => {
        if (socket.roomId) {
            io.to(socket.roomId).emit('chat_message', { sender: socket.username || 'Guest', msg });
        }
    });

    socket.on('leave_game', () => {
        handlePlayerExit(socket);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        handlePlayerExit(socket);
    });
});

function handlePlayerExit(socket) {
    if (socket.roomId && activeRooms[socket.roomId]) {
        const room = activeRooms[socket.roomId];
        const leftPlayer = room.players.find(p => p.id === socket.id);
        if (!leftPlayer) return;

        if (room.gameState === 'lobby') {
            room.players = room.players.filter(p => p.id !== socket.id);
            if (room.players.length === 0) {
                delete activeRooms[socket.roomId];
            } else {
                if (leftPlayer.isHost) {
                    room.players[0].isHost = true;
                }
                io.to(socket.roomId).emit('room_updated', room);
            }
        } else {
            // Game is playing: convert to bot takeover
            leftPlayer.isBot = true;
            leftPlayer.id = null; // Unlink socket ID
            
            // Notify remaining players
            io.to(socket.roomId).emit('player_left_game', { 
                name: leftPlayer.name, 
                color: leftPlayer.color 
            });

            // If the leaving player was host, migrate to next remaining human
            if (leftPlayer.isHost) {
                leftPlayer.isHost = false;
                const nextHuman = room.players.find(p => p.id && p.id !== socket.id && !p.isBot);
                if (nextHuman) {
                    nextHuman.isHost = true;
                }
            }

            // Check if all players are bots now
            const allBots = room.players.every(p => p.isBot);
            if (allBots) {
                delete activeRooms[socket.roomId];
            } else {
                io.to(socket.roomId).emit('room_updated', room);
            }
        }
        
        socket.leave(socket.roomId);
        socket.roomId = null;
    }
}

server.listen(PORT, () => {
    console.log(`Ludo game server running on port ${PORT}`);
});
