require('./environments/env')();

const https = require('https');
const fs = require('fs');
const mongoose = require('mongoose');

const express = require('express');

const app = express();
app.use(express.json());

const ErrorClass = require('./services/errorClass');
const employee = require('./routes/employee');
const team = require('./routes/team');
const leave = require('./routes/leave');
const admin = require('./routes/holidays');

const key = fs.readFileSync('key.pem');
const cert = fs.readFileSync('cert.pem');
const credentials = {
    key,
    cert,
};

const httpsServer = https.createServer(credentials, app);
const port = process.env.PORT || 8000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,DELETE,PATCH,OPTIONS'
    );
    next();
});

app.get('/home', (req, res) => {
    res.send('Home page');
});
app.use('/employees', employee);
app.use('/leave-dashboard', leave);
app.use('/team', team);
app.use('/admin', admin);

app.all('*', req => {
    throw new ErrorClass(`Requested URL ${req.path} not found!`, 404);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: statusCode,
        message: err.message || 'Internal Server Error!',
    });
});

httpsServer.listen(port, () => {
    mongoose
        .connect(process.env.MONGODB_URL_VM, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        })
        .then(() => {
            console.log('DB connected. Server is running on ', port);
        })
        .catch(err => {
            console.log(err);
        });
});

module.exports = app;
