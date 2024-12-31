
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
    },
    logging: {
        level: 'info',
        transports: [

        ],
    },
};


export default defaultConfig;
