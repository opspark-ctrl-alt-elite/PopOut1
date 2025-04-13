import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, HasManyGetAssociationsMixin, HasManySetAssociationsMixin, BelongsToManyAddAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin, } from 'sequelize';
import sequelize from './index';
import Category from './Category';
import Vendor from './Vendor';
import UserFollowsVendor from './UserFollowsVendor';
import Event from '../models/EventModel';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  // addFollowedVendor(vendor: Vendor) {
  //   throw new Error('Method not implemented.');
  // }
  // $remove(arg0: string, vendor: Vendor) {
  //   throw new Error('Method not implemented.');
  // }
  // $add(arg0: string, vendor: Vendor) {
  //   throw new Error('Method not implemented.');
  // }
  // FollowedVendors(FollowedVendors: any) {
  //   throw new Error('Method not implemented.');
  // }
  // Vendors(Vendors: any) {
  //   throw new Error('Method not implemented.');
  // }
  declare id: CreationOptional<string>;
  declare google_id: string;
  declare email: string;
  declare name: string;
  declare profile_picture: string | null;
  declare categories?: Category[];
  declare location: string | null;
  declare is_vendor: boolean;
  declare fcm_token: string | null;
  declare created_at: CreationOptional<Date>;
  declare FollowedVendors?: Vendor[];
  
  // mixins
  declare getCategories: HasManyGetAssociationsMixin<Category>;
  declare setCategories: HasManySetAssociationsMixin<Category, string>;
  declare addFollowedVendor: BelongsToManyAddAssociationMixin<Vendor, string>;
  declare getFollowedVendors: BelongsToManyGetAssociationsMixin<Vendor>;
  declare removeFollowedVendor: BelongsToManyRemoveAssociationMixin<Vendor, string>;
  declare addBookmarkedEvent: BelongsToManyAddAssociationMixin<Event, string>;
  declare getBookmarkedEvents: BelongsToManyGetAssociationsMixin<Event>;
  declare removeBookmarkedEvent: BelongsToManyRemoveAssociationMixin<Event, string>;
  //  FollowedVendors: any;
  

  public toJSON(): InferAttributes<User> {
    return super.toJSON();
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_vendor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    fcm_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  }
);

User.hasOne(Vendor, { foreignKey: 'userId', onDelete: 'CASCADE' });
Vendor.belongsTo(User, { foreignKey: 'userId' });

User.belongsToMany(Category, { through: 'UserCategories', foreignKey: 'userId' });
Category.belongsToMany(User, { through: 'UserCategories', foreignKey: 'categoryId' });

export type UserType = InstanceType<typeof User>;

export default User;
