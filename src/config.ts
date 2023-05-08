import * as dotenv from "dotenv";
import path from "node:path";
import { Dialect } from "sequelize";

dotenv.config();

export type Config = {
    appUrl: string;
    dataPath: string;
    db: DatabaseConfig;
    hash: HashConfig;
    mode: string;
    port: number;
};

export type HashConfig = {
    secret: string;
    minLength: number;
};

export type DatabaseConfig = {
    dialect: Dialect,
    storage: string,
    name: string,
    host: string,
    user: string,
    password: string,
}

const mode = process.env.NODE_ENV || "development";

export const config: Config = {
    mode: mode,
    appUrl: process.env.APP_URL || "http://localhost:3000",
    port: parseInt(process.env.PORT || "3000"),
    dataPath: process.env.DATA_PATH || path.resolve("./", "var", "data"),
    db: {
        dialect: (process.env.DB_DIALECT as Dialect || undefined) || "sqlite",
        storage: process.env.DB_STORAGE || path.resolve("./", "var", `${mode}.database.sqlite`),
        name: process.env.DB_NAME || "",
        host: process.env.DB_HOST || "",
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
    },
    hash: {
        secret: process.env.HASH_SECRET || "",
        minLength: parseInt(process.env.HASH_MIN_LENGTH || "11"),
    },
};

export default config;
