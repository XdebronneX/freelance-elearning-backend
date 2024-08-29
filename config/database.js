const mongoose = require('mongoose');

const gvDB = () => {
    mongoose.connect(process.env.DATABASE, {
        serverSelectionTimeoutMS: 5000, 
    }).then(con => {
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
    }).catch(err => console.log(err));
};

module.exports = gvDB;