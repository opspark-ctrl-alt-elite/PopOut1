import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from './index';

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare google_id: string;
  declare email: string;
  declare name: string;
  declare profile_picture: string | null;
  declare categories: 'Food & Drink' | 'Art' | 'Music' | 'Sports & Fitness' | 'Hobbies' | null;
  declare location: string | null;
  declare is_vendor: boolean;
  declare created_at: CreationOptional<Date>;

  // Add this to expose all attributes in type checking
  public toJSON(): InferAttributes<User> {
    return super.toJSON();
  }
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
      type: DataTypes.ENUM('Food & Drink', 'Art', 'Music', 'Sports & Fitness', 'Hobbies'),
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
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  }
);

// Add this to ensure proper typing when using with Express
export type UserType = InstanceType<typeof User>;

export default User;