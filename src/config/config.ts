import * as fs from 'fs';
import * as path from 'path';

function loadJsonFile(filePath: string): any {
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(jsonData);
}

export default function Config () {
    const jsonFilePath = path.join("../../", 'example.json');
    const parsedData = loadJsonFile(jsonFilePath);
    return parsedData;
} ;
