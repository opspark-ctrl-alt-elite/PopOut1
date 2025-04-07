import { DataTypes, Model } from 'sequelize';
import sequelize from './index';
import User from './User';
import Category from './Category';

class Preferences extends Model {}

Preferences.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: { 
        model: User,
        key: 'id',
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { 
        model: Category,
        key: 'id',
      }

    },
  },
  {
    sequelize,
    modelName: 'Preferences',
    tableName: 'preferences',
    timestamps: false,
  }
);

// associations
// User.belongsToMany(Category, { through: Preferences, foreignKey: 'userId', });

// Category.belongsToMany(User, { through: Preferences, foreignKey: 'categoryId', });

export default Preferences;