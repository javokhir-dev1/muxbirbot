import { DataTypes } from "sequelize"
import { sequelize } from "../config/db.js"

export const MuxbirSorov = sequelize.define("MuxbirSorov", {
    muxbir_id: {
        type: DataTypes.STRING
    },
    lavha_id: {
        type: DataTypes.STRING
    },
    message_id: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.STRING
    }
})