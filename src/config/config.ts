
interface Config {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        database_type: string;
    };
    server: {
        port: number;
        host: string;
        domain: string;
        ssl: boolean;
    };
    plugins: {
        directory: string;
    };
    logging: {
        level: string;
        transports: any[];
    };
}


const defaultConfig: Config = {
    database: {
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'mydb',
        database_type:'postgres'
    },
    server: {
        port: 3000,
        host: 'localhost',
        domain: 'localhost',
        ssl: false,
    },
    plugins: {
        directory: 'src/plugins',
    },
    logging: {
        level: 'info',
        transports: [
        ],
    },
} as Config;


export default defaultConfig;
