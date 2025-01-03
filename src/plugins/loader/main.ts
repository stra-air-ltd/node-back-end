import * as fs from 'fs';
import * as path from 'path';
import * as Hapi from '@hapi/hapi';
import Config from '../../config/config';

export default async function LoaderPluginAll(server: Hapi.Server) {
    const pluginsDirectory: string = "../../" + Config.plugins.directory;
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

    for (registeredPluginsNumber; registeredPluginsNumber === fileCount ; registeredPluginsNumber++) {
        const file of contentsFiles
        const filePath: string = path.join(pluginsDirectory, file); 
    }

    console.log(`已注册 ${registeredPluginsNumber} 个插件，共 ${fileCount} 个插件`);
}
