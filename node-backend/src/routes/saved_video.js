import db from '../DB/db.js';
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const savedVideoRouter = new Router();
// Get all saved videos for a user
savedVideoRouter.get('/saved-videos/:userId', async (req, res) => {
    try {
        const query = 'SELECT * FROM SavedVideos WHERE user_id = ?';
        const [videos] = await db.query(query, [req.params.userId]);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save a video for a user
savedVideoRouter.post('/save-video', async (req, res) => {
    try {
        const { userId, videoLink } = req
        .body;
        const videoId = uuidv4();
        const [result] = await db.query(
            'INSERT INTO SavedVideos (user_id, video_id, video_link) VALUES (?, ?, ?)',
            [userId, videoId, videoLink]
        );
        
        res.status(201).json({ 
            message: 'Video saved successfully',
            videoId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a saved video
savedVideoRouter.delete('/saved-video/:userId/:videoId', async (req, res) => {
    try {
        const query = 'DELETE FROM SavedVideos WHERE user_id = ? AND video_id = ?';
        const [result] = await db.query(query, [req.params.userId, req.params.videoId]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Saved video not found' });
        }
        res.json({ message: 'Saved video removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default savedVideoRouter;