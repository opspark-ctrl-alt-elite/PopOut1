import sequelize from "./index";
import { DataTypes, Model } from "sequelize";

export class User extends Model {
  // id!: string;
  // google_id!: string;
  // email!: string;
  // name!: string;
  // profile_picture?: string;
  // categories?: string;
  // location?: string;
  // is_vendor!: boolean;
  // created_at!: Date;
}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    google_id: {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categories: {
      type: DataTypes.ENUM(
        "Food & Drink",
        "Art",
        "Music",
        "Sports & Fitness",
        "Hobbies"
      ),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_vendor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false,
  }
);

export default User;
