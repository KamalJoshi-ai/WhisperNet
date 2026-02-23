const jwt = require("jsonwebtoken");

const generateToken = (userId)=>{
  return jwt.sign({ userId }, process.env.JSON_WEBTOKEN_KEY, {
    expiresIn: "1y",
  });
}
module.exports=generateToken;

