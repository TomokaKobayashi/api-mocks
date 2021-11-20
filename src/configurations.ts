import fs from 'fs';

const DEFAULT_CONFIG = "./config.default.json";
export type Config = {
  port?: number
  dataDirectory?: string
  staticContents?: string
  apiRoot?: string
};

export const loadConfig = (path: string): Config => {
  const configPath = path || DEFAULT_CONFIG;
  const rawFile = fs.readFileSync(configPath);
  const config = JSON.parse(rawFile.toString()) as Config;
  return config
};
