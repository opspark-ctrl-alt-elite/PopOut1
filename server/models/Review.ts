import { DataTypes, Model } from 'sequelize';
import sequelize from './index';
import User from './User';
import Vendor from './Vendor';

class Review extends Model {}

Review.init(
  {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Associate review to a vendor.
    vendorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'vendors',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'review',
  }
);

// Associations: Reviews are created by Users and belong to Vendors.


export default Review;
