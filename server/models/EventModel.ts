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
    // category: {
    //   type: DataTypes.ENUM("Food & Drink", "Art", "Music", "Sports & Fitness", "Hobbies"),
    //   allowNull: false,
    // },
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

// Event with Vendor
// Vendor.hasMany(Event, { foreignKey: "vendor_id", onDelete: "CASCADE" });
// Event.belongsTo(Vendor, { foreignKey: "vendor_id" });

// event with category
// Event.belongsToMany(Category, { through: 'EventCategories', foreignKey: 'eventId' });
// Category.belongsToMany(Event, { through: 'EventCategories', foreignKey: 'categoryId' });

// Event.belongsTo(Category, { foreignKey: "category_id" });
// Category.hasMany(Event, { foreignKey: "category_id" });

export default Event;