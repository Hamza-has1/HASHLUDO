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

    socket.on('create_room', (maxPlayers) => {
        const roomId = 'LUDO-' + Math.floor(1000 + Math.random() * 9000);
        const playerLimit = parseInt(maxPlayers) || 4;
        
        activeRooms[roomId] = {
            id: roomId,
            players: [{ id: socket.id, name: socket.username || 'HostPlayer', color: 'red', isHost: true }],
            maxPlayers: playerLimit,
            gameState: 'lobby',
            turnIdx: 0,
            diceRoll: null
        };
        socket.join(roomId);
        socket.roomId = roomId;
        socket.emit('room_created', activeRooms[roomId]);
    });

    socket.on('join_room', (roomId) => {
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

        const colors = ['green', 'yellow', 'blue'];
        const assignedColor = colors[room.players.length - 1] || 'blue';
        
        room.players.push({ 
            id: socket.id, 
            name: socket.username || ('Player_' + (room.players.length + 1)), 
            color: assignedColor,
            isHost: false
        });
        
        socket.join(roomId);
        socket.roomId = roomId;
        io.to(roomId).emit('room_updated', room);
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

    socket.on('roll_dice', () => {
        const room = activeRooms[socket.roomId];
        if (room && room.gameState === 'playing') {
            const rollValue = Math.floor(Math.random() * 6) + 1;
            room.diceRoll = rollValue;
            io.to(socket.roomId).emit('dice_rolled', { roller: socket.id, value: rollValue });
        }
    });

    socket.on('send_chat', (msg) => {
        if (socket.roomId) {
            io.to(socket.roomId).emit('chat_message', { sender: socket.username || 'Guest', msg });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        if (socket.roomId && activeRooms[socket.roomId]) {
            const room = activeRooms[socket.roomId];
            const leftPlayer = room.players.find(p => p.id === socket.id);
            room.players = room.players.filter(p => p.id !== socket.id);
            
            if (room.players.length === 0) {
                delete activeRooms[socket.roomId];
            } else {
                // If Host disconnected and game hasn't started, assign a new host
                if (leftPlayer && leftPlayer.isHost && room.gameState === 'lobby') {
                    room.players[0].isHost = true;
                }
                io.to(socket.roomId).emit('room_updated', room);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Ludo game server running on port ${PORT}`);
});
