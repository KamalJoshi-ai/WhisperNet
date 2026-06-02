const jwt = require ('jsonwebtoken');
const response = require('../utils/responseHandler')

const authMiddleware =(req,res,next)=>{
    const authToken = req.cookies?.authToken;

 if (!authToken){
    return response(res,401,"authorization token missing")
 }

try {
     const decode = jwt.verify(authToken, process.env.JSON_WEBTOKEN_KEY);
     req.user = decode;
    
     next();
} catch (error) {
    return response(res,401,"invalid or expired token")
}
}

module.exports=authMiddleware;
