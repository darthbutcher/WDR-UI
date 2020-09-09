'use strict';

const config = require('../config.json');
const MySQLConnector = require('../services/mysql.js');
const db = new MySQLConnector(config.db.brock);

class PVP {
    constructor(guildId, userId, pokemonId, form, league, minRank, minPercent, city) {
        this.guildId = guildId;
        this.userId = userId;
        this.pokemonId = pokemonId;
        this.form = form;
        this.league = league;
        this.minRank = minRank;
        this.minPercent = minPercent;
        this.city = city;
    }

    async create() {
        const sql = `
        INSERT INTO wdr_subscriptions (guild_id, user_id, pokemon_id, form, league, min_rank, min_percent, city)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const args = [
            this.guildId, this.userId,
            this.pokemonId, this.form,
            this.league,
            this.minRank, this.minPercent,
            this.city
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async getAll(guildId, userId) {
        const sql = `
        SELECT guild_id, user_id, pokemon_id, form, league, min_rank, min_percent, city
        FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ? AND sub_type='pvp'
        `;
        const args = [guild, userId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new PVP(
                    
                    result.guild_id,
                    result.user_id,
                    result.pokemon_id,
                    result.form,
                    result.league,
                    result.min_rank,
                    result.min_percent,
                    result.city
                ));
            });
            return list;
        }
        return null;
    }
    
    static async getPokemonByLeague(guildId, userId, pokemonId, form, league, city) {
        const sql = `
        SELECT guild_id, user_id, pokemon_id, form, league, min_rank, min_percent, city
        FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ? AND pokemon_id = ? AND form = ? AND league = ? AND city = ? 
        `;
        const args = [guildId, userId, pokemonId, form, league, city];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new PVP(
                
                result.guild_id,
                result.user_id,
                result.pokemon_id,
                result.form,
                result.league,
                result.min_rank,
                result.min_percent,
                result.city
            );
        }
        return null;
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

    static async save(id, guildId, userId, pokemonId, form, league, minRank, minPercent, city) {
        const sql = `
        UPDATE wdr_subscriptions
        SET pokemon_id = ?, form = ?, league = ?, min_rank = ?, min_percent = ?, city = ?
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [
            pokemonId,
            form,
            league,
            minRank,
            minPercent,
            city,
            guildId,
            userId,
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = PVP;