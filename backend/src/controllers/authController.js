const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const User = require('../models/User');
const db = require('../config/db');

const signToken = (user) => 
    jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d'}
    );

const sanitize = (user) => {
    const { password, ...rest } = user;
    return rest;
};

// POST /api/auth/register
const register = async (req, res, next) => {
    try {
        const { email, username, password, full_name } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email, username và password'});
        };
        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự'});
        };

        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({ message: 'Email đã được sử dụng'});
        };

        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ message: 'Username đã được sử dụng'});
        };

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            username,
            password: hashedPassword,
            full_name: full_name || username,
        });

        const token = signToken(user);

        return res.status(201).json({
            message: 'Đăng ký thành công',
            token,
            user: sanitize(user),
        }); 
    } catch(err) {
        next(err);
    }
};

// POST /api/auth/login - hỗ trợ đăng nhập bằng email HOẶC username
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email/username và password'});
        };

        // Tìm user theo email hoặc username
        let user = await User.findByEmail(email);
        if (!user) {
            user = await User.findByUsername(email);
        }

        if (!user) {
            return res.status(401).json({ message: 'Email/username hoặc mật khẩu không đúng'})
        }

        if (!user.is_active) {
            return res.status(403).json({ message: 'Tài khoản đã bị khoá. Vui lòng liên hệ admin.'})
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email/username hoặc mật khẩu không đúng'})
        }

        const token = signToken(user);

        return res.status(200).json({
            message: 'Đăng nhập thành công',
            token,
            user: sanitize(user), 
        })
    } catch (err) {
        next(err);
    };
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User không tồn tại'})
        };
        return res.status(200).json({
            user: sanitize(user),
        });
    } catch (err) {
        next(err);
    }
}

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
    try {
        const {oldPassword, newPassword} = req.body
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới' });
        };
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        };

        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update(req.user.id, { password: hashedPassword });
        return res.status(200).json({ message: 'Đổi mật khẩu thành công' });

    } catch (err) {
        next(err);
    };
};

module.exports = { register, login, getMe, changePassword };