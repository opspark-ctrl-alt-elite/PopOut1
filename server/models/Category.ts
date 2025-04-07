import { DataTypes, Model, CreationOptional } from 'sequelize';
import sequelize from './index';
import User from './User';
import Event from './EventModel';
import Preferences from './Preferences';


export class Category extends Model {
  declare id: CreationOptional<number>;
  declare name: string;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false,
  }
);

// Category.belongsToMany(User, { through: 'UserCategories', foreignKey: 'categoryId' });
// Category.belongsToMany(Event, { through: 'EventCategories', foreignKey: 'categoryId' });

export default Category;