import './DB/db.js';
import express from 'express';
import userRouter from './routes/user.js';
import savedVideoRouter from './routes/saved_video.js';

// Create Express app
const app = express();
app.use(express.json());
app.use('/user', userRouter);
app.use(savedVideoRouter);


// Example route
app.get('/', (req, res) => {
    res.send('Welcome to the Express server!');
});

// Start the server
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;