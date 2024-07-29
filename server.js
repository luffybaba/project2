const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Read data from JSON files
const readData = (filename) => {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
};

// Write data to JSON files
const writeData = (filename, data) => {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
};

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin login
app.post('/admin/login', (req, res) => {
    const admins = readData('admin.json');
    const { username, password } = req.body;
    const admin = admins.find(admin => admin.username === username && admin.password === password);
    if (admin) {
        res.send({ success: true });
    } else {
        res.send({ success: false, message: 'Invalid credentials' });
    }
});

// CRUD Operations for items
app.get('/items', (req, res) => {
    const items = readData('items.json');
    res.send(items);
});

app.post('/items', (req, res) => {
    const items = readData('items.json');
    const newItem = req.body;
    newItem.id = items.length ? items[items.length - 1].id + 1 : 1;
    newItem.rating = [];
    items.push(newItem);
    writeData('items.json', items);
    res.send(newItem);
});

app.put('/items/:id', (req, res) => {
    const items = readData('items.json');
    const id = parseInt(req.params.id);
    const updatedItem = req.body;
    const itemIndex = items.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        items[itemIndex] = { ...items[itemIndex], ...updatedItem };
        writeData('items.json', items);
        res.send(items[itemIndex]);
    } else {
        res.status(404).send({ message: 'Item not found' });
    }
});

app.delete('/items/:id', (req, res) => {
    const items = readData('items.json');
    const id = parseInt(req.params.id);
    const newItems = items.filter(item => item.id !== id);
    if (newItems.length !== items.length) {
        writeData('items.json', newItems);
        res.send({ message: 'Item deleted' });
    } else {
        res.status(404).send({ message: 'Item not found' });
    }
});

// Add rating to item
app.post('/items/:id/rate', (req, res) => {
    const items = readData('items.json');
    const id = parseInt(req.params.id);
    const { rating } = req.body;
    const item = items.find(item => item.id === id);
    if (item) {
        item.rating.push(rating);
        writeData('items.json', items);
        res.send(item);
    } else {
        res.status(404).send({ message: 'Item not found' });
    }
});

// Serve user interface items as HTML
app.get('/user-items', (req, res) => {
    const items = readData('items.json');
    let itemsHTML = '';
    items.forEach(item => {
        itemsHTML += `
            <div class="item">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div>
                    <label for="rating-${item.id}">Rate: </label>
                    <select id="rating-${item.id}">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                    <button onclick="rateItem(${item.id})">Submit Rating</button>
                </div>
                <p>Ratings: ${item.rating.join(', ')}</p>
            </div>
        `;
    });
    res.send(itemsHTML);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
