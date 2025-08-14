// pm2-monitor.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const pm2 = require('pm2');
const { spawn } = require('child_process');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = 4000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('Client terhubung');

    // Kirim data monitoring setiap 3 detik
    const sendPM2Data = () => {
        pm2.connect(err => {
            if (err) {
                socket.emit('pm2-error', err.message);
                return;
            }
            pm2.list((err, list) => {
                if (err) {
                    socket.emit('pm2-error', err.message);
                } else {
                    socket.emit('pm2-data', list);
                }
                pm2.disconnect();
            });
        });
    };

    sendPM2Data();
    const interval = setInterval(sendPM2Data, 3000);

    // Menerima request log dari client
    socket.on('get-logs', (appName) => {
        const logProcess = spawn('pm2', ['logs', appName, '--lines', '20', '--raw']);

        logProcess.stdout.on('data', (data) => {
            socket.emit('pm2-log', data.toString());
        });

        logProcess.stderr.on('data', (data) => {
            socket.emit('pm2-log', data.toString());
        });

        socket.on('disconnect', () => {
            logProcess.kill();
        });
    });

    socket.on('disconnect', () => {
        console.log('Client terputus');
        clearInterval(interval);
    });
});

server.listen(PORT, () => {
    console.log(`PM2 Monitor berjalan di http://localhost:${PORT}`);
});
