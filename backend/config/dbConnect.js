const mongoose = require('mongoose');
const name = "Talkio";

const connectDb=async()=>{
  
mongoose.connect(process.env.MONGODB_URI, {dbName: name})  .then(() => console.log("MongoDb Connected..! "+name))
  .catch((err) => console.log(err));
}
   
module.exports = connectDb;