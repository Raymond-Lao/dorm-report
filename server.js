const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(express.static(__dirname));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

let communities = {};

io.on('connection', (socket) => {
  console.log('用户连接:', socket.id);
  
  socket.emit('initialData', communities);
  
  socket.on('submitReport', (data) => {
    communities[data.communityId] = {
      ...data,
      timestamp: Date.now()
    };
    io.emit('dataUpdate', communities);
    console.log(`社区${data.communityId}提交了数据`);
  });
  
  socket.on('resetAll', () => {
    communities = {};
    io.emit('dataUpdate', communities);
    console.log('所有数据已重置');
  });
  
  socket.on('disconnect', () => {
    console.log('用户断开连接:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`静态文件访问: http://localhost:${PORT}/dorm-report.html`);
});