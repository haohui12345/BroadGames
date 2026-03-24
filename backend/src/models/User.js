const db = require('../config/db');

const User = {    
    //tìm user theo email, username, id
    findByEmail: (email) => 
        db('users').where({ email }).first(),

    findByUsername: (username) =>
        db('users').where({ username }).first(),

    findById: (id) =>
        db('users').where({ id }).first(),

    //khi tạo user mới, trả về user vừa tạo (bỏ pass)
    create: async (data) => {
        const [user] = await db('users')
        .insert({ ...data, is_active: true })
        .returning(['id', 'email', 'username', 'full_name', 'avatar_url', 'role', 'created_at']);
        return user;
    },

    //cập nhật user
    update: (id, data) =>
        db('users')
            .where({ id }) 
            .update({ ...data, updated_at: db.fn.now() }),
};

module.exports = User;
