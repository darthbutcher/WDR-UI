'use strict';

const config = require('../config.json');
const MySQLConnector = require('../services/mysql.js');
const db = new MySQLConnector(config.db.brock);

class Pokemon {
    constructor(guildId, userId, pokemonId, form, minIV, maxIV, minLvl, maxLvl, gender, geotype) {
        this.guildId = guildId;
        this.userId = userId;
        this.pokemonId = pokemonId;
        this.form = form;
        this.minIV = minIV;
        this.maxIV = maxIV;
        this.minLvl = minLvl;
        this.maxLvl = maxLvl;
        this.gender = gender;
        this.geotype = geotype;
    }

    async create() {
        const sql = `
        INSERT INTO wdr_subscriptions (sub_type, guild_id, user_id, pokemon_id, form, min_iv, max_iv, min_lvl, max_lvl, gender, geotype)
        VALUES ('pokemon', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'city')
        `;
        const args = [
            this.guildId, this.userId,
            this.pokemonId, this.form,
            this.minIV, this.maxIV,            
            this.minLvl, this.maxLvl,
            this.gender
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }

    static async getAll(guildId, userId) {
        const sql = `
        SELECT guild_id, user_id, pokemon_id, form, min_cp, min_iv, max_iv, min_lvl, max_lvl, gender, geotype
        FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ? AND sub_type = 'pokemon'
        `;
        const args = [guildId, userId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const list = [];
            results.forEach(result => {
                list.push(new Pokemon(
                    result.guild_id,
                    result.user_id,
                    result.pokemon_id,
                    result.form,
                    result.min_cp,
                    result.min_iv,
                    result.max_iv,
                    result.min_lvl,
                    result.max_lvl,
                    result.gender,
                    result.geotype
                ));
            });
            return list;
        }
        return null;
    }

    static async getByPokemon(guildId, userId, pokemonId) {
        const sql = `
        SELECT guild_id, user_id, pokemon_id, form, min_cp, min_iv, max_iv, min_lvl, max_lvl, gender, geotype
        FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ? AND pokemon_id = ? AND sub_type = 'pokemon'
        `;
        const args = [guildId, userId, pokemonId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Pokemon(
                result.guild_id,
                result.user_id,
                result.pokemon_id,
                result.form,
                result.min_cp,
                result.min_iv,
                result.max_iv,
                result.min_lvl,
                result.max_lvl,
                result.gender,
                result.geotype
            );
        }
        return null;
    }

    static async deleteByPokemonId(guildId, userId, pokemonId) {
        const sql = `
        DELETE FROM wdr_subscriptions
        WHERE guild_id = ? AND user_id = ? AND pokemon_id = ? 
        `;
        const args = [guildId, userId, pokemonId];
        const results = await db.query(sql, args);
        if (results && results.length > 0) {
            const result = results[0];
            return new Pokemon(
                result.guild_id,
                result.user_id,
                result.pokemon_id
                );
    
        return result.affectedRows === 1;
        }
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

    static async save(guildId, userId, pokemonId, form, minCP, minIV, ivList, minLvl, maxLvl, gender, city) {
        const sql = `
        UPDATE wdr_subscriptions
        SET pokemon_id = ?, form = ?, min_cp = ?, min_iv = ?, iv_list = ?, min_lvl = ?, max_lvl = ?, gender = ?, city = ?
        WHERE guild_id = ? AND user_id = ?
        `;
        const args = [
            pokemonId,
            form,
            minCP,
            minIV,
            JSON.stringify(ivList),
            minLvl,
            maxLvl,
            gender,
            city,
            guildId,
            userId
        ];
        const result = await db.query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Pokemon;