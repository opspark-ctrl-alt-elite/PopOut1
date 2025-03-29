import User from './User';
import Vendor from './Vendor';
import Category from './Category';


User.hasOne(Vendor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Vendor.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Category, { through: 'UserCategories', foreignKey: 'userId' });
Category.belongsToMany(User, { through: 'UserCategories', foreignKey: 'categoryId' });