require('dotenv').config();

const app = require('./app');
const mongoose = require('mongoose');

const databaseURL = process.env.DATABASE_URL; 
const port = process.env.PORT || 8080;

mongoose
  .connect(databaseURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connection successful');

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1);
  });
