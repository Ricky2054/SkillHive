import db from "../DB/db.js";
import { Router } from "express";
import bcrypt from 'bcrypt';
import findByCredentials from '../middleware/findByCredentials.js';
import rateLimiter from "../middleware/rateLimiter.js";
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const userRouter = new Router();

const EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Add this function to check for common passwords
const isCommonPassword = (password) => {
    const commonPasswords = [
        '12345678', 'password', 'qwerty', '123456789', 
        'password123', 'admin123', '11111111', '00000000'
        // Add more common passwords as needed
    ];
    return commonPasswords.includes(password);
};

// Function to validate password
const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    if (!PASSWORD_REGEX.test(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }
    if (isCommonPassword(password)) {
        return 'Password is too common. Please choose a stronger password';
    }
    return null; // null means password is valid
};

// Get all users
userRouter.get('/all', (req, res) => {
    db.query('SELECT * FROM Users WHERE EXISTS (SELECT 1 FROM Users)', (err, results) => {
        if (err) {
            console.error('Error fetching users:', err.message);
            res.status(500).send('Error fetching users');
        } else {
            res.status(200).json(results);
        }
    });
});

// Get single user by ID
userRouter.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    db.query('SELECT * FROM Users WHERE EXISTS (SELECT 1 FROM Users WHERE user_id = ?) AND user_id = ?', 
        [userId, userId], 
        (err, results) => {
            if (err) {
                console.error('Error fetching user:', err.message);
                res.status(500).send('Error fetching user');
            } else if (results.length === 0) {
                res.status(404).send('User not found');
            } else {
                res.status(200).json(results[0]);
            }
        }
    );
});

// Delete all users (be careful with this in production!)
userRouter.delete('/all', (req, res) => {
    db.query('DELETE FROM Users WHERE EXISTS (SELECT 1 FROM (SELECT * FROM Users) AS u)', (err, results) => {
        if (err) {
            console.error('Error deleting users:', err.message);
            res.status(500).send('Error deleting users');
        } else {
            res.status(200).json({
                message: 'All users deleted successfully',
                deletedCount: results.affectedRows
            });
        }
    });
});


userRouter.post('/signup', async (req, res) => {
    const { email, password, full_name } = req.body;
    const user_id = uuidv4();
    
    // Email validation
    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Password validation
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ error: passwordError });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = jwt.sign({ user_id, email }, 'your-secret-key-here');
        
        db.query(
            `INSERT INTO Users (user_id, email, password, full_name, jwt_token) 
             SELECT ?, ?, ?, ?, JSON_ARRAY(?)
             WHERE NOT EXISTS (SELECT 1 FROM Users WHERE email = ?)`,
            [user_id, email, hashedPassword, full_name, token, email],
            (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err.message);
                    res.status(500).send('Error inserting user');
                } else if (result.affectedRows === 0) {
                    res.status(400).json({ error: 'User already exists' });
                } else {
                    res.status(200).json({
                        message: 'User added successfully!',
                        user: {
                            user_id,
                            email,
                            full_name
                        },
                        token,
                        auth_instructions: 'Store this token and include it in the Authorization header for subsequent requests'
                    });
                }
            }
        );
    } catch (err) {
        console.error('Error hashing password:', err);
        res.status(500).send('Error creating user');
    }
});

userRouter.post('/login', rateLimiter, findByCredentials, (req, res) => {
    const token = jwt.sign({ 
        user_id: req.user.user_id, 
        email: req.user.email 
    }, 'your-secret-key-here');

    db.query(
        `UPDATE Users 
         SET jwt_token = JSON_ARRAY_APPEND(
             COALESCE(jwt_token, JSON_ARRAY()), 
             '$', 
             ?
         )
         WHERE EXISTS (SELECT 1 FROM (SELECT * FROM Users) AS u WHERE user_id = ?) 
         AND user_id = ?`,
        [token, req.user.user_id, req.user.user_id],
        (err, result) => {
            if (err) {
                console.error('Error updating token:', err);
                return res.status(500).send('Error updating token');
            }
            if (result.affectedRows === 0) {
                return res.status(404).send('User not found');
            }
            res.status(200).json({
                message: 'Login successful',
                user: {
                    user_id: req.user.user_id,
                    email: req.user.email,
                    full_name: req.user.full_name
                },
                token,
                auth_instructions: 'Store this token and include it in the Authorization header for subsequent requests'
            });
        }
    );
});

// Optional: Add a logout route to remove a specific token
userRouter.post('/logout', auth, (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    db.query(
        `UPDATE Users 
         SET jwt_token = JSON_REMOVE(
             jwt_token,
             JSON_UNQUOTE(JSON_SEARCH(jwt_token, 'one', ?))
         )
         WHERE EXISTS (SELECT 1 FROM (SELECT * FROM Users) AS u WHERE user_id = ?)
         AND user_id = ?`,
        [token, req.user.user_id, req.user.user_id],
        (err, result) => {
            if (err) {
                console.error('Error removing token:', err);
                return res.status(500).send('Error logging out');
            }
            res.status(200).json({ message: 'Logged out successfully' });
        }
    );
});

// Optional: Add a logout from all devices route
userRouter.post('/logout/all', auth, (req, res) => {
    db.query(
        `UPDATE Users 
         SET jwt_token = JSON_ARRAY()
         WHERE EXISTS (SELECT 1 FROM (SELECT * FROM Users) AS u WHERE user_id = ?)
         AND user_id = ?`,
        [req.user.user_id, req.user.user_id],
        (err, result) => {
            if (err) {
                console.error('Error removing all tokens:', err);
                return res.status(500).send('Error logging out');
            }
            res.status(200).json({ message: 'Logged out from all devices successfully' });
        }
    );
});

// Protected routes using auth middleware
userRouter.get('/profile', auth, (req, res) => {
    db.query('SELECT user_id, email, full_name FROM Users WHERE EXISTS (SELECT 1 FROM Users WHERE user_id = ?) AND user_id = ?', 
        [req.user.user_id, req.user.user_id], 
        (err, results) => {
            if (err) {
                console.error('Error fetching user profile:', err.message);
                res.status(500).send('Error fetching user profile');
            } else if (results.length === 0) {
                res.status(404).send('User not found');
            } else {
                res.status(200).json(results[0]);
            }
        }
    );
});

export default userRouter;