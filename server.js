// Core Dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Custom Dependencies
require('./src/schedule/cronjob');
const { logger } = require('./src/utils/logger');
const { PORT } = require('./src/core/config');

// Routers
const baseRouter = require('./src/router');
const productRouter = require('./src/router/productRouter');
// const userRouter = require('./src/router/userRouter');
// const walletRouter = require('./src/router/walletRouter');
const transactionRouter = require('./src/router/transactionRouter');
const adminRouter= require('./src/router/adminRouter')

// App Init
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ credentials: true, origin: '*' }));
app.use(morgan('tiny'));

// Router Middleware
app.use('/', baseRouter);
app.use('/api', productRouter);
app.use('/api', adminRouter);
// app.use('/api', walletRouter);
app.use('/api', transactionRouter);

// console.log(require('./src/db/mongoose').d);
require('./src/db/mongoose').db().then(()=> app.listen(PORT, () =>
logger.info(`Booking Backend Service Started on port ${PORT}`)
));
