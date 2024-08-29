const path = require("path")
require('dotenv').config({ path: path.resolve(__dirname, './config/.env') }); 

const app = require("./app"); 
const gvDB = require("./config/database"); 
const cloudinary = require("cloudinary").v2; 


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//connect to database
gvDB();

//start the express server
app.listen(process.env.PORT, () => {
    console.log(`server started in ${process.env.NODE_ENV} mode `);
});