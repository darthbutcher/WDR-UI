'use strict';

const config = require('../config.json');
const MySQLConnector = require('../services/mysql.js');
const db = new MySQLConnector(config.db.brock);

class Invasion {
    constructor(guildId, userId, rewardPokemonId, city) {
        this.guildId = guildId;
        this.userId = userId;
        this.rewardPokemonId = rewardPokemonId;
        this.city = city;
    }

    async create() {
        const sql = `
        INSERT INTO wdr_subscriptions (guild_id, user_id, reward_pokemon_id, city)
        VALUES (?, ?, ?, ?, ?)
        `;
        const args = [
            this.guildId, this.userId,
            this.rewardPokemonId, this.city
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async getAll(guildId, userId) {
        const sql = `
        SELECT guild_id, user_id, reward_pokemon_id, city
        FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Invasion(
                    
                    result.guild_id,
                    result.user_id,
                    result.reward_pokemon_id,
                    result.city
                ));
            });
            return list;
        }
        return null;
    }

    static async getById(id) {
        const sql = `
        SELECT guild_id, user_id, reward_pokemon_id, city
        FROM wdr_subscriptions
        WHERE id = ?
        `;
        const args = [id];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Invasion(
                
                result.guild_id,
                result.user_id,
                result.reward_pokemon_id,
                result.city
            );
        }
        return null;
    }

    static async getByReward(guildId, userId, reward, city) {
        const sql = `
        SELECT guild_id, user_id, reward_pokemon_id, city
        FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ? AND reward_pokemon_id = ? AND city = ?
        LIMIT 1
        `;
        const args = [guildId, userId, reward, city];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Invasion(
                
                result.guild_id,
                result.user_id,
                result.reward_pokemon_id,
                result.city
            );
        }
        return null;
    }
    
    static async delete(guildId, userId, rewardPokemonId, city) {
        const sql = `
        DELETE FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ? AND reward_pokemon_id = ? AND city = ?
        `;
        const args = [guildId, userId, rewardPokemonId, city];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async deleteById(id) {
        const sql = `
        DELETE FROM wdr_subscriptions
        WHERE id = ?
        `;
        const args = [id];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async deleteAll(guildId, userId) {
        const sql = `
        DELETE FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [guildId, userId];
        const result = await db.query(sql, args);
        return result.affectedRows > 0;
    }

    static async save(id, guildId, userId, reward, city) {
        const sql = `
        UPDATE invasions
        SET reward_pokemon_id = ?, city = ?
        WHERE guild_id = ? AND user_id = ? AND id = ?
        `;
        const args = [
            reward,
            city,
            guildId,
            userId,
            id
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Invasion;