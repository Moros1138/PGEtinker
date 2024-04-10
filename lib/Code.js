import { Model, DataTypes } from "sequelize";

export class Code extends Model {}

export async function SetupCodeDatabase(sequelize)
{
    Code.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },    
        slug: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hashedCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, { sequelize, tableName: "codes" });

    await Code.sync({ alter: true });
}

