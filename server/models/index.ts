import { Sequelize } from "sequelize"

const sequelize = new Sequelize('popout', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
});

import Review from './Review';
const forceSync = async () => {
  try {
    // Disable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Force sync all models
    await sequelize.sync({ force: true });

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('synced');
  } catch (err) {
    console.error('Error syncing', err);
  }
};

forceSync();

export default sequelize;
