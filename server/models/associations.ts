import User from './User';
import Vendor from './Vendor';
import Category from './Category';
import Event from './EventModel'
import Review from './Review';
import Preferences from './Preferences';
import UserFollowsVendor from './UserFollowsVendor';

Review.belongsTo(User, { foreignKey: 'user_id' });
Review.belongsTo(Event, { foreignKey: 'event_id' });
User.hasMany(Review, { foreignKey: 'user_id' });
Event.hasMany(Review, { foreignKey: 'event_id' });

User.hasOne(Vendor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Vendor.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Category, { through: 'UserCategories', foreignKey: 'userId' });
Category.belongsToMany(User, { through: 'UserCategories', foreignKey: 'categoryId' });

// Event with Vendor

Vendor.hasMany(Event, { foreignKey: 'vendor_id', as: 'events', onDelete: 'CASCADE' });
Event.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

// Event with Category (Many-to-Many)
Event.belongsToMany(Category, { through: 'EventCategories', foreignKey: 'eventId' });
Category.belongsToMany(Event, { through: 'EventCategories', foreignKey: 'categoryId' });


// preferences
User.belongsToMany(Category, { through: 'Preferences', foreignKey: 'userId', });
Category.belongsToMany(User, { through: 'Preferences', foreignKey: 'categoryId', });

// Associate review to vendor
Review.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(Vendor, { foreignKey: 'vendorId' });
Vendor.hasMany(Review, { foreignKey: 'vendorId' });


// user follows vendor
User.belongsToMany(Vendor, { through: UserFollowsVendor, foreignKey: 'userId', as: 'followedVendors' });
Vendor.belongsToMany(User, { through: UserFollowsVendor, foreignKey: 'vendorId', as: 'followers' });

