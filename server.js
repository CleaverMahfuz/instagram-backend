import mongoose from "mongoose";
import cors from 'cors'
import express from 'express'
import DbModel from './DbModel.js'
import multer from 'multer'
import UserDb from "./UserDb.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"



const app = express();
const port = process.env.PORT || 8080;


app.use(express.json())
app.use(cors())


const connection_url = 'mongodb+srv://mahfuz:kolabador123@cluster0.cdfda.mongodb.net/instagram?retryWrites=true&w=majority';
// const db = ''
mongoose
    .connect(connection_url, { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useFindAndModify: false,
        // useCreateIndex: true,
      })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err))

app.get('/',(req,res)=>res.status(200).send("it is working wow!!!"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "../instagram-clone/public/images/")
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname)
    },
  })
  
  const uploadStorage = multer({ storage: storage })
  
  // Single file
//   app.post("/upload/single", uploadStorage.single("imageUrl"), (req, res) => {
//     console.log(req.file)
//     return res.send("Single file")
  
//   })
  app.post("/upload/single", uploadStorage.single("file"), (req, res,) => { 
        // return res.send("Single file")
        // console.log(req.imageUrl.filename);
        var obj = {
          file: req.file.filename,
          UserName:req.body.UserName,
          status:req.body.status,
        }
        DbModel.create(obj,(err,data)=>{
            if(err){
                res.status(500).send(err)
            }
            else{
                res.status(201).send(req.file.filename)
                res.status(201).send(data)
                console.log(req.file.filename)
            }
        })
})


app.post("/upload/single/update",
 async (req, res) => { 
  const postalId = req.body.id; 
  const comment = req.body.comments;
  // console.log(postalId)
  // console.log(comment)
  try{
    if(postalId){
      let findPost = await DbModel.findById({
       _id:postalId
      })
      if(findPost){
        console.log("post exist and we can use")
        // console.log(findPost)
        const commenting = comment ;
        await DbModel.findByIdAndUpdate({_id:postalId},      {
          $push: {
              comments: commenting
          }
      });
        res.send("Comment was added successfully");
      }
      else{
        console.log("post does not exist")
      }
    }
    else{
      console.log("we did not find the id")
    }

  } catch(e){
    console.log(e)

  }
})







app.get('/sync', (req, res) => {
    DbModel.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(201).send(data)
        }
    }).sort( {file: -1,UserName:-1} )


});



//  <<<<<<<<<<<this the script of user Athentication in the user model>>>>>>>>>>>





app.post("/userinfoUp", 
 async (req, res) => {
 const username = req.body.username;
 const email = req.body.email;
 const password = req.body.password;
    try {
      let user = await UserDb.findOne({
            username
        });
        if (user) {
           res.status(500).send("user Already exists")
           console.log("user already")
        }else{ 
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
        user = new UserDb({
            username,
            email,
            password
        });
        await user.save();
      }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
}
);

app.post(
  "/userinfo/sign",
  async (req, res) => {
    const { email, password } = req.body;
    try {
      let user = await UserDb.findOne({
        email
      });
      if (!user){
         res.status(400).json({
          message: "User Not Exist"
        });}

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: "Incorrect Password !"
        });

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        "randomString",
        {
          expiresIn: "1y"
        },
        (err, token) => {
          if (err) throw err;
          res.json({
            token
          });
          // localStorage.setItem("token", token);
          console.log("your token is : " + token);
        }
      );
    } catch (e) {
      console.error(e);
      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);


const auth = (req, res, next) => {
  const { authorization } = req.headers
  // console.log(token);
  // if (!token){res.status(401).json({ message: "Auth Error" });}

  try {
    const token = authorization.split(' ')[1];
    if(token){
    const decoded = jwt.verify(token, "randomString");
    req.user = decoded.user;
    next();}
    else{
      res.status(401).json({ message: "Auth Error" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Invalid Token" });
  }
};


app.get('/userinfo', (req, res) => {
    UserDb.find((err,data)=>{
        if(err){
            res.status(500).send(err)
  
        }
        else{
            // console.log(data.user)
            res.status(201).send(data)
            console.log(data)
            
        }
    })
  
  });
  




  app.get("/authenticatduser", auth, async (req, res) => {
    try {
      // request.user is getting fetched from Middleware after token authentication
      const user = await UserDb.findById(req.user.id);
      res.json(user);
      // console.log(user);
      // console.log("successfully fatched data of that user")
    } catch (e) {
      res.send({ message: "Error in Fetching user" });
    }
  });

















  // app.get('/userinfo/sign', (req, res) => {
  //   UserDb.find((err,data)=>{
  //       if(err){
  //           res.status(500).send(err)
  
  //       }
  //       else{
  //           console.log(data.user)
  //           res.status(201).send(data)
  //         //   console.log(data)
            
  //       }
  //   })
  
  // });





app.listen(port, ()=>console.log(`listening on the localhost:${port}`));



// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "uploads/")
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + "-" + file.originalname)
//     },
//   })
  
//   const uploadStorage = multer({ storage: storage })
  
//   // Single file
//   app.post("/upload/single", uploadStorage.single("imageUrl"), (req, res) => {
//     console.log(req.file)
//     return res.send("Single file")
  
  
  
//   })
//   //Multiple files
//   app.post("/upload/multiple", uploadStorage.array("file", 10), (req, res) => {
//     console.log(req.files)
//     return res.send("Multiple files")
//   })