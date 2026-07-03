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

    socket.on('create_room', () => {
        const roomId = 'LUDO-' + Math.floor(1000 + Math.random() * 9000);
        activeRooms[roomId] = {
            id: roomId,
            players: [{ id: socket.id, name: socket.username || 'Guest', color: 'red' }],
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
        if (room && room.players.length < 4 && room.gameState === 'lobby') {
            const colors = ['green', 'yellow', 'blue'];
            const assignedColor = colors[room.players.length - 1] || 'blue';
            room.players.push({ id: socket.id, name: socket.username || 'Guest', color: assignedColor });
            socket.join(roomId);
            socket.roomId = roomId;
            io.to(roomId).emit('room_updated', room);
        } else {
            socket.emit('join_error', 'Room is full or doesn\'t exist');
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
        // Handle disconnect room cleanup
        if (socket.roomId && activeRooms[socket.roomId]) {
            const room = activeRooms[socket.roomId];
            room.players = room.players.filter(p => p.id !== socket.id);
            if (room.players.length === 0) {
                delete activeRooms[socket.roomId];
            } else {
                io.to(socket.roomId).emit('room_updated', room);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Ludo game server running on port ${PORT}`);
});
