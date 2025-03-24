import { Sequelize} from "sequelize"

const sequelize = new Sequelize('popout', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

sequelize.sync({ alter: true })
  .then(() => console.log('synced'))
  .catch((err) => console.error('Error syncing', err));

export default sequelize;

