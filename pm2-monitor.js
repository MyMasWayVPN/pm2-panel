const express = require('express');
const pm2 = require('pm2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Get list of processes
app.get('/api/list', (req, res) => {
    pm2.connect(err => {
        if (err) return res.status(500).send(err.message);
        pm2.list((err, list) => {
            if (err) return res.status(500).send(err.message);
            res.json(list);
            pm2.disconnect();
        });
    });
});

// Control actions: start, stop, restart, delete
app.post('/api/action', (req, res) => {
    const { action, name } = req.body;
    pm2.connect(err => {
        if (err) return res.status(500).send(err.message);

        switch (action) {
            case 'stop':
                pm2.stop(name, () => { res.json({ status: 'stopped' }); pm2.disconnect(); });
                break;
            case 'start':
                pm2.start(name, () => { res.json({ status: 'started' }); pm2.disconnect(); });
                break;
            case 'restart':
                pm2.restart(name, () => { res.json({ status: 'restarted' }); pm2.disconnect(); });
                break;
            case 'delete':
                pm2.delete(name, () => { res.json({ status: 'deleted' }); pm2.disconnect(); });
                break;
            default:
                res.status(400).json({ error: 'Invalid action' });
                pm2.disconnect();
        }
    });
});

// Get logs for an app
app.get('/api/logs/:name', (req, res) => {
    const { name } = req.params;
    const { spawn } = require('child_process');
    const logStream = spawn('pm2', ['logs', name, '--lines', '50', '--nostream']);

    let output = '';
    logStream.stdout.on('data', data => output += data.toString());
    logStream.stderr.on('data', data => output += data.toString());
    logStream.on('close', () => res.send(`<pre>${output}</pre>`));
});

app.listen(PORT, () => console.log(`PM2 Panel running at http://localhost:${PORT}`));
