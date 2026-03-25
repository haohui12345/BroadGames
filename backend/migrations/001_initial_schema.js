/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema

    // ── 1. USERS ──────────────────────────────────────────────
    .createTable('users', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.string('email').unique().notNullable();
      t.string('username').unique().notNullable();
      t.string('password').notNullable();
      t.string('full_name');
      t.string('avatar_url');
      t.text('bio');
      t.enu('role', ['client', 'admin']).notNullable().defaultTo('client');
      t.boolean('is_active').notNullable().defaultTo(true);
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // ── 2. GAMES ──────────────────────────────────────────────
    .createTable('games', (t) => {
      t.increments('id').primary();
      t.string('code', 30).unique().notNullable();
      t.string('name').notNullable();
      t.text('description');
      t.text('rules');
      t.string('image_url');
      t.integer('board_size').notNullable().defaultTo(15);
      t.integer('min_players').notNullable().defaultTo(1);
      t.integer('max_players').notNullable().defaultTo(2);
      t.boolean('is_enabled').notNullable().defaultTo(true);
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // ── 3. GAME SESSIONS ──────────────────────────────────────
    .createTable('game_sessions', (t) => {
      t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      t.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      t.uuid('host_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.uuid('guest_id').references('id').inTable('users').onDelete('SET NULL');
      t.boolean('vs_computer').notNullable().defaultTo(false);
      t.enu('status', ['waiting', 'playing', 'finished', 'abandoned']).notNullable().defaultTo('waiting');
      t.uuid('winner_id').references('id').inTable('users').onDelete('SET NULL');
      t.integer('board_size').notNullable().defaultTo(15);
      t.jsonb('board_state');
      t.jsonb('move_history').defaultTo('[]');
      t.integer('score_host').defaultTo(0);
      t.integer('score_guest').defaultTo(0);
      t.timestamp('started_at');
      t.timestamp('finished_at');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // ── 4. GAME SAVES (save / load) ───────────────────────────
    .createTable('game_saves', (t) => {
      t.increments('id').primary();
      t.uuid('session_id').notNullable().references('id').inTable('game_sessions').onDelete('CASCADE');
      t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.string('save_name', 100);
      t.jsonb('board_state').notNullable();
      t.jsonb('move_history').defaultTo('[]');
      t.timestamp('saved_at').defaultTo(knex.fn.now());
    })

    // ── 5. RANKINGS ───────────────────────────────────────────
    .createTable('rankings', (t) => {
      t.increments('id').primary();
      t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      t.integer('wins').notNullable().defaultTo(0);
      t.integer('losses').notNullable().defaultTo(0);
      t.integer('draws').notNullable().defaultTo(0);
      t.bigInteger('total_score').notNullable().defaultTo(0);
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.unique(['user_id', 'game_id']);
    })

    // ── 6. ACHIEVEMENTS ───────────────────────────────────────
    .createTable('achievements', (t) => {
      t.increments('id').primary();
      t.string('code', 50).unique().notNullable();
      t.string('name', 100).notNullable();
      t.text('description');
      t.text('icon_url');
      // NULL = thành tựu toàn hệ thống, có id = thành tựu riêng game
      t.integer('game_id').references('id').inTable('games').onDelete('CASCADE');
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })

    .createTable('user_achievements', (t) => {
      t.increments('id').primary();
      t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.integer('achievement_id').notNullable().references('id').inTable('achievements').onDelete('CASCADE');
      t.timestamp('unlocked_at').defaultTo(knex.fn.now());
      t.unique(['user_id', 'achievement_id']);
    })

    // ── 7. FRIENDSHIPS ────────────────────────────────────────
    .createTable('friendships', (t) => {
      t.increments('id').primary();
      t.uuid('requester_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.uuid('receiver_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.enu('status', ['pending', 'accepted', 'blocked']).notNullable().defaultTo('pending');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.unique(['requester_id', 'receiver_id']);
    })

    // ── 8. MESSAGES ───────────────────────────────────────────
    .createTable('messages', (t) => {
      t.increments('id').primary();
      t.uuid('sender_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.uuid('receiver_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.text('content').notNullable();
      t.boolean('is_read').notNullable().defaultTo(false);
      t.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // ── 9. GAME RATINGS & COMMENTS ────────────────────────────
    // THÊM MỚI: đề bài yêu cầu rating và comment cho mỗi game
    .createTable('game_ratings', (t) => {
      t.increments('id').primary();
      t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.integer('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
      t.smallint('rating').notNullable().checkBetween([1, 5]);
      t.text('comment');
      t.timestamp('created_at').defaultTo(knex.fn.now());
      t.timestamp('updated_at').defaultTo(knex.fn.now());
      t.unique(['user_id', 'game_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('game_ratings')
    .dropTableIfExists('messages')
    .dropTableIfExists('friendships')
    .dropTableIfExists('user_achievements')
    .dropTableIfExists('achievements')
    .dropTableIfExists('rankings')
    .dropTableIfExists('game_saves')
    .dropTableIfExists('game_sessions')
    .dropTableIfExists('games')
    .dropTableIfExists('users');
};