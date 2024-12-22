import db from '../DB/db.js';
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const interestRouter = new Router();

// Create a new interest
interestRouter.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const query = 'INSERT INTO Interests (name) VALUES (?)';
        
        const [result] = await db.query(query, [name]);
        res.status(201).json({ message: 'Interest created successfully', interest_id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all interests
interestRouter.get('/', async (req, res) => {
    try {
        const [interests] = await db.query('SELECT * FROM Interests');
        res.json(interests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update interest
interestRouter.put('/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const query = 'UPDATE Interests SET name = ? WHERE interest_id = ?';
        
        const [result] = await db.query(query, [name, req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Interest not found' });
        }
        res.json({ message: 'Interest updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete interest
interestRouter.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM Interests WHERE interest_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Interest not found' });
        }
        res.json({ message: 'Interest deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// user-interests.routes.js
const express = require('express');
const router = express.Router();

// Create a new user interest
router.post('/', async (req, res) => {
    try {
        const { user_id, interest_id } = req.body;
        const user_interest_id = uuidv4();
        
        const query = 'INSERT INTO User_Interests (user_interest_id, user_id, interest_id) VALUES (?, ?, ?)';
        await db.query(query, [user_interest_id, user_id, interest_id]);
        
        res.status(201).json({ message: 'User interest created successfully', user_interest_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user interests by user_id
router.get('/user/:userId', async (req, res) => {
    try {
        const query = `
            SELECT ui.*, i.name as interest_name 
            FROM User_Interests ui 
            JOIN Interests i ON ui.interest_id = i.interest_id 
            WHERE ui.user_id = ?`;
        
        const [userInterests] = await db.query(query, [req.params.userId]);
        res.json(userInterests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete user interest
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM User_Interests WHERE user_interest_id = ?', [req.params.id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User interest not found' });
        }
        res.json({ message: 'User interest deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default interestRouter;