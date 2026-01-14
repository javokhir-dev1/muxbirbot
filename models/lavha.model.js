import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"

// sana, type_lavha, user_id, ball

export const Lavha = sequelize.define("Lavha", {
    user_id: {
        type: DataTypes.STRING
    },
    type_lavha: {
        type: DataTypes.STRING
    },
    sana: {
        type: DataTypes.STRING
    },
    ball: {
        type: DataTypes.STRING
    }
})