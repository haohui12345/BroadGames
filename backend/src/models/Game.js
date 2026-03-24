const db = require('../config/db')

const Game = {
    findAll: (onlyEnable = false) => {
        const query = db('games').orderBy('id');
        if (onlyEnable) query.where({ is_enabled: true});
        return query;
    },

    findById: (id) =>
        db('games').where({ id }).first(),
    
    create: (data) => 
        db('games').insert(data).returning('*'),

    update: (id, data) => 
        db('games').where({ id }).update({ ...data, updated_at: db.fn.now() }),

    delete: (id) => 
        db('games').where({ id }).del(),
    
};

module.exports = Game;