import * as fs from 'fs';
import * as path from 'path';
import * as Hapi from '@hapi/hapi';
import * as dotenv from 'dotenv';

export default async function LoaderPluginAll(server: Hapi.Server) {
    dotenv.config();
    const pluginsDirectory: string = "../" + process.env.PLUGINS_DIRECTORY;
    const contentsFiles: string[] = fs.readdirSync(pluginsDirectory);

    let registeredPluginsNumber: number;
    let fileCount: number;

    registeredPluginsNumber = 0;
    fileCount = 0;

    
    console.log('正在注册插件，请稍等...');
    
    contentsFiles.forEach((file) => {
        const filePath:string = path.join(pluginsDirectory, file);

        if (fs.statSync(filePath).isFile()) {
            fileCount++;
        }
    });

    for (const file of contentsFiles) {
        const filePath: string = path.join(pluginsDirectory, file);
        console.log(`加载插件: ${filePath}`);
        const plugin = require(filePath).default;

        try {
            await server.register(plugin);
            registeredPluginsNumber++;
            console.log(`插件 ${file} 注册成功`);
        } catch (err) {
            console.error(`插件 ${file} 注册失败:`, err);
        }

        registeredPluginsNumber++; 
        if (registeredPluginsNumber === fileCount) {
            console.log('注册插件数目已达到文件数目，注册结束');
            break;
        }
    }

    console.log(`已注册 ${registeredPluginsNumber} 个插件，共 ${fileCount} 个插件`);
}
