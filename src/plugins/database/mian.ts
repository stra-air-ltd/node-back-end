import { createPool } from 'mysql2/promise';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export default function databaseQusry(sqlSentence: string) {
    switch (true) {
        case process.env.DATABASE_TYPE === 'mysql':
            const connectMysql = createPool({
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT as unknown as number,
                user: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE
            })
            connectMysql.query(sqlSentence)
                .then(([rows, fields]) => {
                    return {
                        message: '查询成功',
                        code: 200,
                        data: rows
                    }
                })
                .catch((err) => {
                    return {
                        message: '查询失败' + err, 
                        code: 400,
                        data: null
                    }
                });
            break;

        case process.env.DATABASE_TYPE ==='postgres':
            const connectPostgres = new Pool({
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT as unknown as number,
                user: process.env.DATABASE_USERNAME,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE
            }); 
            connectPostgres.query(sqlSentence)
                .then((res) => {
                    return {
                        message: '查询成功',
                        code: 200,
                        data: res.rows
                    }
                })
                .catch((err) => {
                    return {
                        message: '查询失败' + err,
                        code: 400,
                        data: null
                    }
                });
            break;
        
        default:
            return {
                message: '数据库类型错误,请检查配置文件 DATABASE_TYPE 字段是否正确',
                code: 400,
                data: null
            }
            break;
    }
}

export function databaseConnectTest() {
    interface testRespond {
        message: string,
        code: number,
        data: any
    }

    const testRespond = databaseQusry("FROM * `" + process.env.DATABAS_USERNAMEE + "`") as testRespond;

    if (testRespond.code === 200) {
        return {
            message: '数据库连接成功',
            code: 200,
            data: null
        }
    } else {
        return {
            message: '数据库连接失败',
            code: 400,
            data: null
        }
    }
}