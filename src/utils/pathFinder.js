import { fileURLToPath } from "url";
import path from 'path';
import dotenv from 'dotenv';

const pathFinder = () => {
    const __filename =  fileURLToPath(import.meta.url);
    const __dirname =  path.dirname(__filename);

    return dotenv.config({ path: path.resolve(__dirname, '../../.env')})
}

export default pathFinder;


