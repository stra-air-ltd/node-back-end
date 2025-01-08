import * as fs from 'fs';
import * as path from 'path';
import * as Hapi from '@hapi/hapi';
import * as dotenv from 'dotenv';
import { plugin } from '@hapi/inert';

let numberTimes = 0;

async function countFilesInDirectory(directoryPath: string): Promise<number> {

    let Count = 0;

    async function traverseDirectory(currentPath: string) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
    
            if (entry.isDirectory()) {
                await traverseDirectory(fullPath);
            } else if (entry.isFile()) {
                Count++;
            }
        }
    }

    await traverseDirectory(directoryPath);
    return Count;
}

export default async function LoaderPluginAll(server: Hapi.Server) {
    dotenv.config();
    const pluginsDirectory: string = process.env.PLUGINS_DIRECTORY as string;

    let registeredPluginsNumber: number = 0;
    let fileCount: number = 0;

    console.log('正在注册插件，请稍等...');

    await countFilesInDirectory(pluginsDirectory)
    .then(Count => {
        fileCount = Count;
        console.log(`在 ${pluginsDirectory} 下有 ${Count} 个插件`);
    })
    .catch(err => {
        console.error(`读取目录失败:`, err);
    });
    
    async function loaderPlugin(currentPath: string) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
    
            if (entry.isDirectory()) {
                await loaderPlugin(fullPath);
            } else if (entry.isFile()) {
                const pluginPath = path.resolve(fullPath);
                let plugin = require(pluginPath).default;
                
                try {
                    await server.register(plugin);
                    registeredPluginsNumber++;
                    console.log(`插件 ${fullPath} 注册成功`);
                } catch (err) {
                    console.error(`插件 ${fullPath} 注册失败:`, err);
                }
            }

            if (registeredPluginsNumber === fileCount) {
            //    console.log(`已注册插件数达到文件数量，停止注册`);
            //    break;
            }

            if (numberTimes === 0) {
                numberTimes++;
            }
        }
    }
    await loaderPlugin(pluginsDirectory);
    console.log(`已注册 ${registeredPluginsNumber} 个插件，共 ${fileCount} 个插件`);
}
