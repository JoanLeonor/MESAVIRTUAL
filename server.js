const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Estado en memoria de las salas de juego (para desarrollo)
// Estructura: { roomId: { elements: {}, players: {} } }
const rooms = {};

// Rutas de subida de archivos
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// --- BASE DE DATOS LOCAL (FASE 7) ---
const DB_FILE = path.join(__dirname, 'db.json');

// Inicializar DB si no existe
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ categories: [], images: [] }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// -- RUTAS DE CATEGORÍAS --
app.get('/api/categories', (req, res) => res.json(readDB().categories));

app.post('/api/categories', (req, res) => {
    const db = readDB();
    const newCat = { id: uuidv4(), ...req.body };
    db.categories.push(newCat);
    writeDB(db);
    res.json(newCat);
});

app.put('/api/categories/:id', (req, res) => {
    const db = readDB();
    const index = db.categories.findIndex(c => c.id === req.params.id);
    if(index > -1) {
        db.categories[index] = { ...db.categories[index], ...req.body };
        writeDB(db);
        res.json(db.categories[index]);
    } else {
        res.status(404).json({ error: 'Category not found' });
    }
});

app.delete('/api/categories/:id', (req, res) => {
    const db = readDB();
    db.categories = db.categories.filter(c => c.id !== req.params.id);
    // Mover imágenes de esta categoría a "Sin Categoría" (null)
    db.images.forEach(img => { if(img.categoryId === req.params.id) img.categoryId = null; });
    writeDB(db);
    res.json({ success: true });
});

// -- RUTAS DE IMÁGENES (ASSETS) --
app.get('/api/images', (req, res) => res.json(readDB().images));

app.post('/api/images', (req, res) => {
    const db = readDB();
    const newImg = { id: uuidv4(), ...req.body };
    db.images.push(newImg);
    writeDB(db);
    res.json(newImg);
});

app.put('/api/images/:id', (req, res) => {
    const db = readDB();
    const index = db.images.findIndex(i => i.id === req.params.id);
    if(index > -1) {
        db.images[index] = { ...db.images[index], ...req.body };
        writeDB(db);
        res.json(db.images[index]);
    } else {
        res.status(404).json({ error: 'Image not found' });
    }
});

app.delete('/api/images/:id', (req, res) => {
    const db = readDB();
    db.images = db.images.filter(i => i.id !== req.params.id);
    writeDB(db);
    res.json({ success: true });
});

// Socket.io WebSockets
io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.id}`);

    // Unirse a una sala
    socket.on('join-room', (roomId, userName) => {
        socket.join(roomId);
        
        if (!rooms[roomId]) {
            rooms[roomId] = { elements: {}, players: {} };
        }
        
        // Registrar jugador
        rooms[roomId].players[socket.id] = {
            id: socket.id,
            name: userName || `Jugador-${socket.id.substring(0,4)}`,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            cursor: { x: 0, y: 0 }
        };
        
        // Enviar estado actual de la sala al usuario que se acaba de conectar
        socket.emit('room-state', rooms[roomId]);
        
        // Notificar a los demás que alguien entró
        socket.to(roomId).emit('player-joined', rooms[roomId].players[socket.id]);
        
        console.log(`${socket.id} se unió a la sala ${roomId}`);

        // Manejo de desconexión específico para esta sala
        socket.on('disconnect', () => {
            if (rooms[roomId] && rooms[roomId].players[socket.id]) {
                delete rooms[roomId].players[socket.id];
                socket.to(roomId).emit('player-left', socket.id);
            }
        });
    });

    // Sincronización de elementos (crear, mover, actualizar)
    socket.on('add-element', (roomId, element) => {
        if (!rooms[roomId]) return;
        rooms[roomId].elements[element.id] = element;
        io.to(roomId).emit('element-added', element);
    });

    socket.on('move-element', (roomId, elementData) => {
        if (!rooms[roomId] || !rooms[roomId].elements[elementData.id]) return;
        // Actualizar coordenadas
        rooms[roomId].elements[elementData.id].x = elementData.x;
        rooms[roomId].elements[elementData.id].y = elementData.y;
        
        // Transmitir a TODOS EXCEPTO al remitente para que no haya latencia visual en su lado
        socket.to(roomId).emit('element-moved', elementData);
    });

    socket.on('update-element', (roomId, elementData) => {
        if (!rooms[roomId] || !rooms[roomId].elements[elementData.id]) return;
        // Actualizar propiedades (rotación, volteo, zIndex)
        Object.assign(rooms[roomId].elements[elementData.id], elementData);
        socket.to(roomId).emit('element-updated', elementData);
    });

    socket.on('delete-element', (roomId, elementId) => {
        if (!rooms[roomId] || !rooms[roomId].elements[elementId]) return;
        delete rooms[roomId].elements[elementId];
        io.to(roomId).emit('element-deleted', elementId);
    });

    // Cursores en tiempo real
    socket.on('cursor-move', (roomId, cursorData) => {
        if (!rooms[roomId] || !rooms[roomId].players[socket.id]) return;
        rooms[roomId].players[socket.id].cursor = cursorData;
        socket.to(roomId).emit('cursor-moved', { id: socket.id, cursor: cursorData });
    });

    // Chat
    socket.on('send-message', (roomId, message) => {
        io.to(roomId).emit('receive-message', {
            sender: rooms[roomId].players[socket.id]?.name || 'Anónimo',
            text: message,
            time: new Date().toLocaleTimeString()
        });
    });

    // Dados
    socket.on('roll-dice', (roomId, result) => {
        const playerName = rooms[roomId].players[socket.id]?.name || 'Anónimo';
        io.to(roomId).emit('dice-rolled', { playerName, result });
    });
});

server.listen(PORT, () => {
    console.log(`Servidor de Mesa Virtual corriendo en http://localhost:${PORT}`);
});
