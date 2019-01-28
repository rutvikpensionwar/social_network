const express = require('express');
const mongoose = require('mongoose');

const app = express();
const db = require('./config/keys').mongoURI;
const users = require('./routes/api/users');
const posts = require('./routes/api/posts');
const profile = require('./routes/api/profile');

mongoose
    .connect(db)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log(error);
    });

app.get('/', (req, res) => {
    res.send('Hello World !!!');
});

app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/profile', profile);

const port = process.env.PORT || 5000;

app.listen(port, () => {
   console.log(`Server running on port ${port}`);
});