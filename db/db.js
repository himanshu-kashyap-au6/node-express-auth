const mongoose = require('mongoose');
const mongodbMemoryServer = require('mongodb-memory-server');
const mongod = new mongodbMemoryServer.MongoMemoryServer();
const { MONGODB_URI, MONGODB_PASSWORD } = process.env;

connectDB = (mongoDBURI) => {
  return mongoose.connect(mongoDBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
};

module.exports = {
  connect: () => {
    return new Promise(async (resolve, reject) => {
      if (process.env.NODE_ENV === 'test') {
        const uri = await mongod.getUri();
        try {
          await connectDB(uri);
          resolve('Test DataBase Connected Successfully...!!!');
        } catch (error) {
          reject(err.message);
        }
      } else {
        await connectDB(MONGODB_URI.replace('<password>', MONGODB_PASSWORD));
        try {
          resolve('ATLAS DataBase Connected Successfully...!!!');
        } catch (error) {
          reject(error.message);
        }
      }
    });
  },
  disconnect: async () => {
    if (process.env.NODE_ENV === 'test') await mongod.stop();
  },
};
