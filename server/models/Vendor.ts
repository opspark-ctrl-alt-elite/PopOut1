import sequelize from "./index";
import { DataTypes, Model } from "sequelize";
import User from "./User";

// define/create Vendor model
export class Vendor extends Model {};

// initialize Vendor model
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
      validate: {
        isEmail: true,
      },
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
    // establish foreign key
    userId: {
      type: DataTypes.UUID,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    // manually create model name
    modelName: "Vendor",
    // manually create table name
    tableName: "vendors",
    // auto-make timestamps
    timestamps: true,
  }
);

// create a one-to-one relationship between User and Vendor
User.hasOne(Vendor);
Vendor.belongsTo(User);

export default Vendor;
