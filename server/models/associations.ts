import User from './User';
import Vendor from './Vendor';
import Category from './Category';
import Event from './EventModel'

User.hasOne(Vendor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Vendor.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Category, { through: 'UserCategories', foreignKey: 'userId' });
Category.belongsToMany(User, { through: 'UserCategories', foreignKey: 'categoryId' });

// Event with Vendor
Vendor.hasMany(Event, { foreignKey: "vendor_id", onDelete: "CASCADE" });
Event.belongsTo(Vendor, { foreignKey: "vendor_id" });

// Event with Category (Many-to-Many)
Event.belongsToMany(Category, { through: 'EventCategories', foreignKey: 'eventId' });
Category.belongsToMany(Event, { through: 'EventCategories', foreignKey: 'categoryId' });

