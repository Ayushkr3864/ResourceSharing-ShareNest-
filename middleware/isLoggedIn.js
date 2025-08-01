const cookies = require("cookies");
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

    function IsLoggedIn(req, res, next) {
      const token = req.cookies.token;
        if (!token) {
            return res.redirect("/login")
        };

      try {
        const data = jwt.verify(token, jwtSecret);
        req.user = data; // ✅ contains latest email
        console.log(data);
        next();
      } catch (err) {
        return res.redirect("/login");
      }
    }
      
module.exports = { IsLoggedIn }