import sequelize from "./index";
import { DataTypes, Model } from "sequelize";
import Vendor from "./Vendor";
import Category from "./Category";

export class Event extends Model {
  declare vendor_id: string;
  declare setCategories: (categories: Category[]) => Promise<void>;
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "vendors",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    venue_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    isFree: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isKidFriendly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isSober: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Event",
    tableName: "events",
    timestamps: true,
  }
);

export default Event;