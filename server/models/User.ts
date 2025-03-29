import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, HasManyGetAssociationsMixin, HasManySetAssociationsMixin } from 'sequelize';
import sequelize from './index';
import Category from './Category';
import Vendor from './Vendor';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare google_id: string;
  declare email: string;
  declare name: string;
  declare profile_picture: string | null;
  declare categories?: Category[];
  declare location: string | null;
  declare is_vendor: boolean;
  declare created_at: CreationOptional<Date>;

  // mixins
  declare getCategories: HasManyGetAssociationsMixin<Category>;
  declare setCategories: HasManySetAssociationsMixin<Category, string>;

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
