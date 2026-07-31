const path = require('path');

// Si hay DATABASE_URL (producción con PostgreSQL), usar esa
// Si no, usar SQLite local (desarrollo)
module.exports = {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '..', 'database.sqlite'),
    logging: false
  },
  production: process.env.DATABASE_URL ? {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  } : {
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '..', 'database.sqlite'),
    logging: false
  }
};
