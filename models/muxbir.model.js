import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"

export const Muxbir = sequelize.define("Muxbir", {
    telegram: {
        type: DataTypes.STRING
    },
    full_name: {
        type: DataTypes.STRING
    },
    hudud: {
        type: DataTypes.STRING
    }
})