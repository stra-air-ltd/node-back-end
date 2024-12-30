interface Config {
    database: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    server: {
        port: number;
        host: string;
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
    },
    server: {
        port: 3000,
        host: 'localhost',
    },
    logging: {
        level: 'info',
        transports: [],
    },
};


export default defaultConfig;
