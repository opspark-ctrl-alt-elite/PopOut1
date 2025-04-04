import { DataTypes, Model } from 'sequelize';
import sequelize from './index';
import User from './User';
import Event from './EventModel';

class Review extends Model {}

Review.init(
  {
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
  },
  {
    sequelize,
    modelName: 'review',
  }
);


export default Review;
