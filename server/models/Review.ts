import { DataTypes, Model } from 'sequelize';
import sequelize from './index';
import User from './User';
import Vendor from './Vendor';

class Review extends Model {
  declare id: string;
  declare rating: number;
  declare comment: string | null;
  declare userId: string;
  declare vendorId: string;
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
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Vendor,
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'review',
    tableName: 'reviews',
    timestamps: true
  }
);

// Associations
;

export default Review;