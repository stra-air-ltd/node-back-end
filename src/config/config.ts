
interface Config {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        database_type: string;
    };
    redis: {
        host: string;
        port: number;
        password: string;
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
        host: '192.168.1.105',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'postgres',
        database_type:'postgres'
    },
    server: {
        port: 3000,
        host: 'localhost',
        domain: 'localhost',
        ssl: false,
    },
    redis: {
        host: 'localhost',
        port: 6379,
        password: '',
    },
    plugins: {
        directory: 'plugins',
    },
    logging: {
        level: 'info',
        transports: [
        ],
    },
} as Config;


export default defaultConfig;
