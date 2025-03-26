import { Sequelize} from "sequelize"

const sequelize = new Sequelize('popout', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

// Create the "popout" database if it doesn't already exist
const createAndSyncDatabase = async () => {
  try {
    await sequelize.query('CREATE DATABASE IF NOT EXISTS `popout`;');
    await sequelize.sync({ alter: true });
    console.log('Database created and synced');
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await sequelize.close();
  }
}

sequelize.sync({ alter: true })
  .then(() => console.log('Synced'))
  .catch((err) => {
    console.error('Error syncing, will attempt to create database...', err);
    createAndSyncDatabase();
  });

export default sequelize;

