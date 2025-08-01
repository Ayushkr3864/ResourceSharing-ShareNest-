const http = require("http");
var express = require("express");
var app = express();
require("dotenv").config();
const session = require("express-session");
const flash = require("connect-flash");
const userModel = require("../Models/users");
const UploadModel = require("../Models/upload");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookies = require("cookies");
const multer = require("multer");
const path = require("path");
const { IsLoggedIn } = require("../middleware/isLoggedIn");
const  cloudinary  = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const { OAuth2Client } = require("google-auth-library");

console.log("CLIENT ID:", process.env.GOOGLE_CLIENT_ID); // Must not be undefined

const { Server } = require("socket.io");
const { updateData } = require("moongose/controller/comments_controller");
const { log } = require("console");
const UserModel = require("moongose/models/user_model");

const jwtSecret = process.env.JWT_SECRET;
console.log(jwtSecret);
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const Storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder:"uploads"
  }
})
app.use(
  session({
    secret: jwtSecret,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(flash());

app.get("/chat", IsLoggedIn,async (req, res) => {
     res.render("chat");
});

/* GET home page. */
// const Storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
const upload = multer({ storage: Storage });
// homepage route
app.get("/", function (req, res) {
  res.render("index");
});


// google Oauth authentication
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
)
app.get("/auth/google", (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    prompt: "consent",
  });
  res.redirect(authorizeUrl);
});


app.get("/auth/google/callback",async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;
    console.log("payload",payload);
    

    let user = await UserModel.findOne({ email: email });
    console.log("user found",user)
    
    if (!user) {
      user = await UserModel.create({
        email,
        name,
        picture,
        username: email.split("@")[0],
        googleId
      });
      log("user created",user)
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard/user");
  } catch (err) {
    console.error("Google auth error", err);
    res.redirect("/login");
  }
});


// login route get
app.get("/login", (req, res) => {
  res.render("login", { error: req.flash("loginError") });
});
// login route post
app.post("/login", async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const userEmail = await userModel.findOne({ email: email });
  console.log("email found", userEmail);
  try {
    if (!userEmail) {
      req.flash("loginError", "email or password is inavlid");
     return res.redirect("/login");
    } else {
      bcrypt.compare(req.body.Password, userEmail.Password, (err, result) => {
        console.log("result",result);
        
        if (result == true) {
          const userToken = jwt.sign( { email: email, userid: userEmail._id,role:userEmail.role }, jwtSecret );
          res.cookie("token", userToken);
          console.log(userToken);
          res.redirect("/dashboard/user");
        } else {
         res.render("error");
        }
      });
    }
  } catch (err) {
    res.send(err);
  }
});

// logout
app.get("/logout", (req, res) => {
  res.cookie("token", " ");
  res.redirect("/");
});
app.get("/register", function (req, res) {
  res.render("register", {
    errors: req.flash("error"),
    usernameExist: req.flash("usernameExist"),
  });
});

// register
app.post("/register", upload.single("picture"), async (req, res) => {
  const { Name, Email, Department, Username, Password } = req.body;
  console.log(req.body.Email);

  try {
    // Check if email already exists
    const existingUserByEmail = await userModel.findOne({ email: Email });
    if (existingUserByEmail) {
      req.flash("error", "Email already exists, please login.");
      return res.redirect("/register");
    }

    // Check if username already exists
    const existingUserByUsername = await userModel.findOne({
      username: Username,
    });
    if (existingUserByUsername) {
      req.flash(
        "usernameExist",
        "Username already taken, please choose another."
      );
      return res.redirect("/register");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    // Create user
    const userCreated = await userModel.create({
      username: Username,
      name: Name,
      email: Email,
      Password: hashedPassword,
      Department: Department,
      picture: req.file?.path || "", // handles if file is missing
    });

    console.log("User created:", userCreated);
    res.redirect("/");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Internal Server Error");
  }
});

// filter on the basis of subject name
app.get("/books", async (req, res) => {
  try {
    const Title = req.query.Title
    if (Title)  Subjecttitle = { $regex: Title, $options: "i" }
    console.log(Title);
    const searchPerformed = true
    const subject = await UploadModel.find({Title:Subjecttitle})
    console.log(subject);
    res.render("resources",{ Results:subject,searchPerformed:searchPerformed })
  }
  catch (err) {
    res.send(err);
  }
  
});

// save book route
app.get("/save-book/:resourceId", IsLoggedIn, async (req, res) => {
  try {
    const resourceId = req.params.resourceId;
    const userId = req.user.userid;
    console.log("user find", userId);
    const savedUpload = await UploadModel.findById(resourceId);
    const user = await userModel.findById(userId);
    console.log("saved upload", savedUpload);
    if (!savedUpload) {
      res.redirect("/resource");
    }
    const alreadySaved = user.savedResources.some(
      (id) => id.toString() === resourceId
    );
    console.log("already saved", alreadySaved);
    if (!alreadySaved) {
      user.savedResources.push(savedUpload._id);
      await user.save();
      return res.redirect("/resource");
    } else {
      console.log("already saved");
      res.redirect("/resource");
    }
  } catch (error) {
    res.send(error);
  }
});
app.get("/upload", IsLoggedIn, (req, res) => {
  res.render("upload");
});
// upload
app.post("/upload", IsLoggedIn, upload.single("file"), async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  console.log(user);
  if (!user) {
    res.send("error");
  }
  const { title, description, type } = req.body;
  try {
    const file = req.file;
    const upload = await UploadModel.create({
      Title: title,
      Description: description,
      Resource_type: type,
      user: user._id,
      file: file.path,
    });
    user.uploads.push(upload._id);
    await user.save();
    res.render("success")
  } catch (err) {
    res.send(err);
  }
});
// dashboard
app.get("/dashboard/user/", IsLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email }).populate("uploads").populate("savedResources");
    if (!user) {
      return res.redirect("/login");
    }
     return res.render("dashboard",{ "user": user,PasswordError:req.flash("PasswordError") },)
  }
  catch (err) {
   return res.send(err);
  }
});
// resources
app.get("/resource", IsLoggedIn, async (req, res) => {
  const resources = await UploadModel.find();
  res.render("resources", { resources: resources,searchPerformed:false });
});
// route to delete resources
app.get("/form", (req, res) => {
  res.render("register")
})
app.get("/delete/:_id", async (req, res) => {
  let data = req.params._id;
  await UploadModel.findByIdAndDelete(data);
  res.redirect("/dashboard/user");
});
app.get("/update/password", (req, res) => {
  res.render("update", { emailError: req.flash("emailError")});
});
app.post("/update/password",async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email);

    const updatedUser = await userModel.findOne({ email: email });
    if (!updatedUser) {
      req.flash("emailError", "email not found");
      res.redirect("/update/password");
    } else {
      const hashPassword = await bcrypt.hash(password, 10);
      console.log(hashPassword);
      updatedUser.Password = hashPassword;
      updatedUser.save();
      res.render("success")
    }
  }
  catch (error){
    res.send(error)
  }
})
//update details
app.post("/update/details", async (req, res) => {
  try {
    let email = req.body.email.trim();
    let newName = req.body.newName;
    let oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword
    console.log(oldPassword);
    console.log(email);
    const Updateduser = await userModel.findOne({ email: email })
    if (!Updateduser) {
      res.send("error")
    }
    if (newName) {
      Updateduser.Name = newName;
      Updateduser.save();
    }
    bcrypt.compare(oldPassword, Updateduser.Password, async (err, result) => {
      if(result==true) {
        const newhashPassword = await bcrypt.hash(newPassword, 10)
        console.log("new hash",newhashPassword);
        Updateduser.Password = newhashPassword
        Updateduser.save()
        console.log(Updateduser);
        res.render("success")
      }
      else{
        req.flash("PasswordError","Old Password is not correct");
        res.redirect("/dashboard/user/");
        console.log("error in password");
      }
    })
  }
  catch {
  }
})

module.exports = app;
