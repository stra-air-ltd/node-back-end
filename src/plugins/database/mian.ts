import Hapi from '@hapi/hapi';
import { createPool } from 'mysql2/promise';
import { Pool } from 'pg';
import dotenv from 'dotenv';

const databasePlugin: Hapi.Plugin<undefined> = {
    name: 'databasePlugin',
    version: '1.0.0',
    register: async (server: Hapi.Server) => {
        dotenv.config();
        const databaseType = process.env.DATABASE_TYPE;
        const port: number = process.env.DATABASE_PORT as unknown as number;
        async function mysqlConnect() {
            const mysqlConnect = createPool({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                port: port,
                connectionLimit: 10
            });

            return mysqlConnect;
        }

        async function postgresConnect() {
            const postgresConnect = new Pool({
                user: process.env.DATABASE_USERNAME,
                host: process.env.DATABASE_HOST,
                database: process.env.DATABASE_NAME,
                password: process.env.DATABASE_PASSWORD,
                port: port,
            });

            return postgresConnect;
        }
        server.method('databaseQuery', async (sql: string) => {
            let queryResult;
            switch (databaseType) {
                case 'mysql':
                    const connection = await mysqlConnect();
                    queryResult = await connection.query(sql);
                break;
                case 'postgres':
                    const postgresconnection = await postgresConnect();
                    queryResult = await postgresconnection.query(sql);
                break;
                default:
                    throw new Error('数据库类型错误 请检查 .env 文件的 DATABASE_TYPE 字段是否正确 当前值为: ' + databaseType);
            }
            return queryResult;
        });
    }
}

export default databasePlugin;