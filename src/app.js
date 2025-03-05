const express = require('express');
const authRoutes = require('./routes/authRoutes');
const astronRoutes = require('./routes/astronRoutes');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/astron', astronRoutes);

module.exports = app;