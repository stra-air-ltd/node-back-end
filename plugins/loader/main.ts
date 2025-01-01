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

        case Config.database.database_type ==='postgres':
            const connectPostgres = new Pool({
                host: Config.database.host,
                port: Config.database.port,
                user: Config.database.username,
                password: Config.database.password,
                database: Config.database.database
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
                message: '数据库类型错误,请检查配置文件 database_type 字段是否正确',
                code: 400,
                data: null
            }
            break;
    }
}

export function databaseConnectTest() {
    const testRespond = databaseQusry("FROM * `" + Config.database.database + "`");
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