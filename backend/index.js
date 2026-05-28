// implement refresh and access token

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require('http')
const connectDb = require("./config/dbConnect");
const app = express();
// express() is a function call that creates an Express application object

dotenv.config();
const authRoute = require("./routes/authRoute");
const chatRoute = require("./routes/chatRoute");
const statusRoute = require("./routes/statusRoute");
const initializeSocket = require('./services/socketService')
//Middleware


app.use(express.json());//convert json to js object 
  // If client sends { "name": "Kamal" }
  // req.body will be { name: "Kamal" }

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
  // If the form sends: name=Kamal&age=22
  // req.body -> { name: "Kamal", age: "22" }

app.use(
  cors({
    origin: "http://localhost:5173", // explicitly allow frontend
    credentials: true, // allow cookies/auth headers
  })
);


connectDb();

// Gives you direct access to the native Node.js http.Server instance.
const server = http.createServer(app);
// http.createServer((req, res) => {
//   app(req, res); // give control to express
// });
//This function inside http.createServerr is app.

const io = initializeSocket(server) 
//here io is instance(meaning an object of class) of socket server it contains all methods of it 

app.use((req,res,next)=>{
  req.io=io;
  req.socketUserMap = io.socketUserMap;
  next();
})

//routes
app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute)
app.use("/api/status", statusRoute);


const PORT = process.env.PORT;

//http.createServer(app).listen(3000)

server.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
