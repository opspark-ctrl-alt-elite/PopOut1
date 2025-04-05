import sequelize from "./index";
import { DataTypes, Model, CreationOptional } from "sequelize";
import Event from "./EventModel";
import Vendor from "./Vendor";

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
      unique: true,
    },
    // Establish foreign keys
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

// Create a one-to-one relationship between Vendor and Image
Vendor.hasOne(Image, { foreignKey: "vendorId", onDelete: "CASCADE" });
Image.belongsTo(Vendor, { foreignKey: "vendorId" });

// Create a one-to-many relationship between Event and Image
Event.hasMany(Image, { foreignKey: "eventId", onDelete: "CASCADE" });
Image.belongsTo(Event, { foreignKey: "eventId" });

export default Image;
