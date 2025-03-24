import sequelize from './index';
import { DataTypes, Model } from 'sequelize';


export class User extends Model {
  public id!: string;
  public google_id!: string;
  public email!: string;
  public name!: string;
  public profile_picture?: string;
  public categories?: string;
  public location?: string;
  public is_vendor!: boolean;
  public created_at!: Date;
}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categories: {
      type: DataTypes.ENUM(
        'Food & Drink',
        'Art',
        'Music',
        'Sports & Fitness',
        'Hobbies'
      ),
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_vendor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  }
);

export default User;