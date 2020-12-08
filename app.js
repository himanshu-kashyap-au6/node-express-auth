const express = require('express');
const dotenv = require('dotenv');
const passport = require('passport');
const cors = require('cors');
const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;
const routes = require('./routes/routes');

require('./Middleware/passport');

app.use(passport.initialize());
app.use(cors());
const { connect } = require('./db/db');
connect()
  .then((res) => console.log(res))
  .catch((err) => console.log(err));

app.use(express.json());

app.get('/', (_, res) => {
  res.status(200).json({
    message: 'Welcome to antarcticaglobal',
  });
});

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});


