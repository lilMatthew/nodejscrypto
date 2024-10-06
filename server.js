const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Conncect đến html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint để sinh khóa ngẫu nhiên
app.get('/generate-key', (req, res) => {
    const keyLength = 32; 
    const randomKey = crypto.randomBytes(keyLength).toString('hex');
    res.json({ key: randomKey });
});

app.post('/encrypt', async (req, res) => {
    const { message, key } = req.body;

    //Kiểm tra độ dài khóa
    if (![32, 48, 64].includes(key.length)) {
        return res.status(400).json({ error: 'Key must be 32, 48, or 64 hex characters long.' });
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    res.json({ encryptedMessage: iv.toString('hex') + ':' + encrypted });
});

app.post('/decrypt', async (req, res) => {
    const { message, key } = req.body;

    
    if (![32, 48, 64].includes(key.length)) {
        return res.status(400).json({ error: 'Key must be 32, 48, or 64 hex characters long.' });
    }

    const textParts = message.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    res.json({ decryptedMessage: decrypted });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});