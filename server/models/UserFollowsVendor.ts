import { DataTypes, Model } from 'sequelize';
import sequelize from './index';
import User from './User';
import Vendor from './Vendor';

class UserFollowsVendor extends Model {}

UserFollowsVendor.init(
  {
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
    modelName: 'UserFollowsVendor',
    tableName: 'userfollowsvendor',
    timestamps: false
  }
);

export default UserFollowsVendor;
