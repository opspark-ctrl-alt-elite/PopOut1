// models/Review.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from './index';

class Review extends Model {
  // Use the 'declare' keyword without initializers so that Sequelize can define getters and setters.
  declare id: string;
  declare rating: number;
  declare comment: string;
  declare userId: string;
  declare vendorId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Review',
    tableName: 'Reviews',
  }
);

export default Review;