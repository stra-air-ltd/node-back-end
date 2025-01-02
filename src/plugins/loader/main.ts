import fs from 'fs';
import path from 'path';
import Hapi from '@hapi/hapi';

export async function registerPluginsFromDirectory(directory: string, server: Hapi.Server) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            await registerPluginsFromDirectory(filePath, server);
        } else if (file.endsWith('.js')) {
            const plugin = require(filePath);
            await server.register(plugin);
        }
    }
}