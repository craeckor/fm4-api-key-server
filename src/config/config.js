import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../');

export default {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    path: process.env.DATABASE_PATH || join(rootDir, 'data/keys.db')
  },
  
  fm4: {
    apiBaseUrl: process.env.FM4_API_BASE_URL || 'https://audioapi.orf.at/fm4/json/4.0'
  }
};
