import User from './User';
import Vendor from './Vendor';
import Category from './Category';
import Event from './EventModel';
import Review from './Review';
import Preferences from './Preferences';
import UserFollowsVendor from './UserFollowsVendor';


Review.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId' });

Review.belongsTo(Event, { foreignKey: 'eventId' });
Event.hasMany(Review, { foreignKey: 'eventId' });

Review.belongsTo(Vendor, { foreignKey: 'vendorId' });
Vendor.hasMany(Review, { foreignKey: 'vendorId' });

User.hasOne(Vendor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Vendor.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Category, { through: 'UserCategories', foreignKey: 'userId' });
Category.belongsToMany(User, { through: 'UserCategories', foreignKey: 'categoryId' });

Vendor.hasMany(Event, { foreignKey: 'vendor_id', as: 'events', onDelete: 'CASCADE' });
Event.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

Event.belongsToMany(Category, { through: 'EventCategories', foreignKey: 'eventId' });
Category.belongsToMany(Event, { through: 'EventCategories', foreignKey: 'categoryId' });


//User.belongsToMany(Category, { through: Preferences, foreignKey: 'userId' });
//Category.belongsToMany(User, { through: Preferences, foreignKey: 'categoryId' });

///// Preferences.belongsTo(User);
///// Preferences.belongsTo(Category);

// User.hasMany(Preferences, { foreignKey: 'userId', onDelete: 'CASCADE' });
// Preferences.belongsTo(User, { foreignKey: 'userId'});

// Category.hasMany(Preferences, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
// Preferences.belongsTo(Category, { foreignKey: 'categoryId' });

User.belongsToMany(Vendor, { through: UserFollowsVendor, foreignKey: 'userId', as: 'followedVendors', });
Vendor.belongsToMany(User, { through: UserFollowsVendor, foreignKey: 'vendorId', as: 'followers', });

// User.belongsToMany(Category, { through: Preferences, foreignKey: 'userId', });
//TODO: may use NULLABLE to make work
// Category.belongsToMany(User, { through: Preferences, foreignKey: 'categoryId', });

User.belongsToMany(Event, { through: 'UserBookmarksEvent', foreignKey: 'userId', as: 'bookmarkedEvents', });
Event.belongsToMany(User, { through: 'UserBookmarksEvent', foreignKey: 'eventId', as: 'usersWhoBookmarked', });