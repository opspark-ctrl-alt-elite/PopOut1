import sequelize from "./index";
import { DataTypes, Model, CreationOptional } from "sequelize";
import User from "./User";

// Define Vendor model
export class Vendor extends Model {
  declare id: CreationOptional<string>;
  declare businessName: string;
  declare email: string;
  declare profilePicture: string | null;
  declare description: string;
  declare website: string | null;
  declare instagram: string | null;
  declare facebook: string | null;
  declare userId: string; // Foreign key
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

// Initialize Vendor model
Vendor.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      // // check if email is real email
      // validate: {
      //   isEmail: true,
      // },
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Establish foreign key
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Vendor",
    tableName: "vendors",
    timestamps: true,
  }
);

// Create a one-to-one relationship between User and Vendor
User.hasOne(Vendor, { foreignKey: "userId", onDelete: "CASCADE" });
Vendor.belongsTo(User, { foreignKey: "userId" });

export default Vendor;
