const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');


const app = express();

app.set('trust proxy', 1);
app.use(cors({
    origin: true,
    credentials: true,
}));

app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

if(!env.isProd) app.use(morgan("dev"));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

async function start() {
    try{
        await connectDB();
        app.listen(env.port, () => {
            console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

process.on("unhandledRejection", (reason) => {
    consolee.error("Unhandled Rejection:", reason);
});

start();

module.exports = app;