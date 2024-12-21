import bcrypt from 'bcrypt';
import db from '../DB/db.js';

const findByCredentials = async (req, res, next) => {
    const { email, password } = req.body;
    
    db.query('SELECT * FROM Users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        req.user = user;
        next();
    });
};

export default findByCredentials; 