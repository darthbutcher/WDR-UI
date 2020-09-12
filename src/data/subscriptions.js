'use strict';

const config = require('../config.json');
const MySQLConnector = require('../services/mysql.js');
const db = new MySQLConnector(config.db.brock);
const locale = require('../services/locale.js');

// TODO: Move to model classes

const createUserSubscription = async (guildId, userId) => {
    const sql = `
    INSERT IGNORE INTO wdr_subscriptions (guild_id, user_id, status)
    VALUES (?, ?, 1, 0, 0, 0, 'Default')
    `;
    const args = [guildId, userId];
    const results = await db.query(sql, args);
    if (results && results.length > 0) {
        console.log('Inserted', results.lastInsertId, 'into subscriptions table');
        return results.lastInsertId;
    }
    return -1;
};

const getUserSubscriptionStats = async (guildId, userId) => {
    const sql = `
    SELECT
        (
            SELECT COUNT(*)
            FROM   wdr_subscriptions
            WHERE guild_id = ? AND user_id = ? AND sub_type='pokemon'
        ) AS pokemon,
        (
            SELECT COUNT(*)
            FROM   wdr_subscriptions
            WHERE guild_id = ? AND user_id = ? AND sub_type='pvp'
        ) AS pvp,
        (
            SELECT COUNT(*)
            FROM   wdr_subscriptions
            WHERE guild_id = ? AND user_id = ? AND sub_type='raid'
        ) AS raids,
        (
            SELECT COUNT(*)
            FROM   wdr_subscriptions
            WHERE guild_id = ? AND user_id = ? AND sub_type='raid'
        ) AS gyms,
        (
            SELECT COUNT(*)
            FROM   wdr_subscriptions
            WHERE guild_id = ? AND user_id = ? AND sub_type='quest'
        ) AS quests,
        (
            SELECT COUNT(*)
            FROM   wdr_subscriptions
            WHERE guild_id = ? AND user_id = ? AND sub_type='invasion'
        ) AS invasions
    FROM wdr_subscriptions
    LIMIT 1;
    `;
    const args = [
        guildId, userId,
        guildId, userId,
        guildId, userId,
        guildId, userId,
        guildId, userId,
        guildId, userId
    ];
    const results = await db.query(sql, args);
    if (results && results.length > 0) {
        return results[0];
    }
    return results;
};

const getPokemonSubscriptions = async (guildId, userId) => {
    const sql = `
    SELECT guild_id, user_id, pokemon_id, form, areas, location, min_cp, min_iv, max_iv, min_lvl, max_lvl, gender, geotype
    FROM wdr_subscriptions
    WHERE guild_id = ? AND user_id = ? AND sub_type='pokemon'
    `;
    const args = [guildId, userId];
    const results = await db.query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = locale.getPokemonName(result.pokemon_id);
            result.cp = `${result.min_cp}-4096`;
            result.iv_list = JSON.parse(result.iv_list || '[]');
            result.lvl = `${result.min_lvl}-${result.max_lvl}`;
            //result.city = result.city;
        });
    }
    return results;
};

const getPvpSubscriptions = async (guildId, userId) => {
    const sql = `
    SELECT guild_id, user_id, pokemon_id, form, league, min_rank, geotype
    FROM wdr_subscriptions
    WHERE guild_id = ? AND user_id = ? AND sub_type='pvp'
    `;
    const args = [guildId, userId];
    const results = await db.query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = locale.getPokemonName(result.pokemon_id);
            //result.min_rank = result.min_rank;
            //result.city = result.city;
        });
    }
    return results;
};

const getRaidSubscriptions = async (guildId, userId) => {
    const sql = `
    SELECT id, guild_id, user_id, pokemon_id, form, city
    FROM wdr_subscriptions
    WHERE guild_id = ? AND user_id = ? AND sub_type='raid'
    `;
    const args = [guildId, userId];
    const results = await db.query(sql, args);
    if (results) {
        results.forEach(result => {
            result.name = locale.getPokemonName(result.pokemon_id);
        });
    }
    return results;
};

const getGymSubscriptions = async (guildId, userId) => {
    const sql = `
    SELECT id, guild_id, user_id, name
    FROM wdr_subscriptions
    WHERE guild_id = ? AND user_id = ? AND sub_type='gym'
    `;
    const args = [guildId, userId];
    const results = await db.query(sql, args);
    return results;
};

const getQuestSubscriptions = async (guildId, userId) => {
    const sql = `
    SELECT id, guild_id, user_id, reward, city
    FROM wdr_subscriptions
    WHERE guild_id = ? AND user_id = ? AND sub_type='quest'
    `;
    const args = [guildId, userId];
    const results = await db.query(sql, args);
    return results;
};

const getInvasionSubscriptions = async (guildId, userId) => {
    const sql = `
    SELECT id, guild_id, user_id, reward_pokemon_id, city
    FROM wdr_subscriptions
    WHERE guild_id = ? AND user_id = ? AND sub_type='invasion'
    `;
    const args = [guildId, userId];
    const results = await db.query(sql, args);
    if (results) {
        results.forEach(result => {
            result.reward = locale.getPokemonName(result.reward_pokemon_id);
        });
    }
    return results;
};

const getSubscriptionSettings = async (guildId, userId) => {
    const sql = `
    SELECT status
    FROM wdr_subscriptions
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [guildId, userId];
    const results = await db.query(sql, args);
    if (results && results.length > 0) {
        return results[0];
    }
    return results;
};

const setSubscriptionSettings = async (guildId, userId, status) => {
    const sql = `
    UPDATE wdr_subscriptions
    SET status = ?
    WHERE guild_id = ? AND user_id = ?
    `;
    const args = [
        status
    ];
    const results = await db.query(sql, args);
    return results.affectedRows > 0;
};

module.exports = {
    createUserSubscription,
    getUserSubscriptionStats,
    getPokemonSubscriptions,
    getPvpSubscriptions,
    getRaidSubscriptions,
    getGymSubscriptions,
    getQuestSubscriptions,
    getInvasionSubscriptions,
    getSubscriptionSettings,
    setSubscriptionSettings
};