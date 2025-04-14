// models/UserBookmarksEvent.ts

import { Model, DataTypes } from "sequelize";
import sequelize from './index';

export class UserBookmarksEvent extends Model {}

UserBookmarksEvent.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: "UserBookmarksEvent",
    tableName: "UserBookmarksEvents", 
    timestamps: false,
  }
);

export default UserBookmarksEvent;