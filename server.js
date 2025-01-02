import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname } from 'path';

// 获取当前文件的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取 dist/server.js 文件的绝对路径并转换为 file:// URL
const serverPath = pathToFileURL(path.resolve(__dirname, 'dist', 'server.js')).href;

// 动态导入并执行 dist/server.js 文件
import(serverPath);