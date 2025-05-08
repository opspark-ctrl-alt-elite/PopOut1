import sequelize from "./index";
import { DataTypes, Model, CreationOptional } from "sequelize";
import Event from "./EventModel";
import Vendor from "./Vendor";
import User from "./User";

// Define Image model
export class Image extends Model {
  declare id: CreationOptional<string>;
  declare imageName: string | null;
  declare filePath: string;
  declare vendorId: string | null; // Foreign key
  declare eventId: string | null; // Foreign key
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

// Initialize Image model
Image.init(
  {
    //TODO: can possibly replace id with publicID
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    referenceURL: {
      type: DataTypes.STRING,
      allowNull: false,
      // TODO: make false maybe
      unique: true,
    },
    // Establish foreign keys
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "vendors",
        key: "id",
      },
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "events",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Image",
    tableName: "images",
    timestamps: true,
  }
);

// Create a one-to-many relationship between User and Image
User.hasMany(Image, { foreignKey: "userId", onDelete: "CASCADE" });
Image.belongsTo(User, { foreignKey: "userId" });

// Create a one-to-many relationship between Vendor and Image
Vendor.hasMany(Image, { foreignKey: "vendorId", onDelete: "CASCADE" });
Image.belongsTo(Vendor, { foreignKey: "vendorId" });

// Create a one-to-many relationship between Event and Image
Event.hasMany(Image, { foreignKey: "eventId", onDelete: "CASCADE" });
Image.belongsTo(Event, { foreignKey: "eventId" });

export default Image;
