import { Model, DataTypes, Optional, Association } from 'sequelize';
import sequelize from './index';
import User from './User';
import Vendor from './Vendor';

interface ReviewAttributes {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  vendorId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: string;
  public rating!: number;
  public comment!: string | null;
  public userId!: string;
  public vendorId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Remove the problematic index signature:
  // [x: string]: string; // <-- This is what's causing the errors

  // Associations
  public static associations: {
    user: Association<Review, User>;
    vendor: Association<Review, Vendor>;
  };
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Vendors',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'Reviews',
    timestamps: true,
  }
);

export default Review;