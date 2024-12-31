import Config from '@/config/config';
import { createPool } from 'mysql2/promise';
import { Pool } from 'pg';

export function databaseQusry(sqlSentence: string) {
    switch (true) {
        case Config.database.database_type === 'mysql':
            const connectMysql = createPool({
                host: Config.database.host,
                port: Config.database.port,
                user: Config.database.username,
                password: Config.database.password,
                database: Config.database.database
            });
            break;

        case Config.database.database_type ==='postgres':
            const connectPostgres = new Pool({
                host: Config.database.host,
                port: Config.database.port,
                user: Config.database.username,
                password: Config.database.password,
                database: Config.database.database
            }); 
            break;
        default:
            return {
                message: '数据库类型错误',
                code: 400
            }
            break;
    }
}