const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const musicRouter = require('./router/router')

const port = process.env.PORT;


app.use('/', musicRouter);

app.listen(port, () => {
    console.log(`server is the running port on ${port}`);
})