import db from '../DB/db.js';
import { Router } from 'express';

const scoreRouter = new Router();

// Create a new score
scoreRouter.post('/', async (req, res) => {
    try {
        const { user_id, total_questions, correct_answers, wrong_answers } = req.body;
        
        // Generate score_id in format: month_year_serial
        const date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const serial = Math.floor(Math.random() * 1000); // You might want a better serial generation logic
        const score_id = `${month}_${year}_${serial}`;
        
        const query = `INSERT INTO Scores (score_id, user_id, total_questions, correct_answers, wrong_answers) 
                      VALUES (?, ?, ?, ?, ?)`;
        
        await db.query(query, [score_id, user_id, total_questions, correct_answers, wrong_answers]);
        res.status(201).json({ message: 'Score created successfully', score_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all scores
scoreRouter.get('/', async (req, res) => {
    try {
        const [scores] = await db.query('SELECT * FROM Scores');
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get scores by user_id
scoreRouter.get('/user/:userId', async (req, res) => {
    try {
        const [scores] = await db.query('SELECT * FROM Scores WHERE user_id = ?', [req.params.userId]);
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update score
scoreRouter.put('/:id', async (req, res) => {
    try {
        const { total_questions, correct_answers, wrong_answers } = req.body;
        const query = `UPDATE Scores 
                      SET total_questions = ?, correct_answers = ?, wrong_answers = ? 
                      WHERE score_id = ?`;
        
        const [result] = await db.query(query, 
            [total_questions, correct_answers, wrong_answers, req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Score not found' });
        }
        res.json({ message: 'Score updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete score
scoreRouter.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Scores WHERE score_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Score not found' });
        }
        res.json({ message: 'Score deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});