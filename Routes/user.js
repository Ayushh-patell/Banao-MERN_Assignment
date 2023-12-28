const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../Models/User");

//(Route:1) creating new user
router.post(
  "/create",
  [
    body("Username", "Invalid User-Name").isLength({ min: 2 }).escape(),
    body("email", "Enter a valid Email").isEmail().escape(),
    body("password", "Invalid Password").isLength({ min: 5 }).escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //if error exists send bad request
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    try {
            //else check if user already exists, if not then create the user
            let user = await User.findOne({ email: req.body.email,  Username: req.body.Username  });
            if (user) {
              return res.status(400).json({
                success: false,
                errors: ["A user already exists with this Email/Username"],
              });
            }
            //create salt and a hash for the password
            const salt = await bcrypt.genSalt(10);
            const MainPass = await bcrypt.hash(req.body.password, salt);
            user = await User.create({
              Username: req.body.Username,
              email: req.body.email,
              password: MainPass,
            });
            //create auth token to send to user
            const authtoken = jwt.sign(
              { id: user.id, Username: user.Username },
              process.env.JWT_SIGN_STRING
            );
            res.send({ success: true, authtoken, Username:user.Username });
    } catch (error) {
      console.log(error)
      res
        .status(500)
        .send({ success: false, errors: ["Internal Server Error"] });
    }
  }
);

//(Route:2) login of user
router.post(
  "/login",
  [
    body("Username", "Enter a valid Username").isLength({ min: 3 }).escape(),
    body("password", "Invalid Password").isLength({ min: 5 }).escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //if error exists send bad request
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const Username = req.body.Username;
    const password = req.body.password;
    try {
      //try to find user with the email
      const user = await User.findOne({ Username });
      if (!user) {
        return res
          .status(400)
          .send({
            success: false,
            errors: ["No user found with this Username"],
          });
      }
      //check password with database
      const passcorrect = await bcrypt.compare(password, user.password);
      if (!passcorrect) {
        return res
          .status(400)
          .send({ success: false, errors: ["Invalid Credentials"] });
      }
      //create auth token to send to user
      const authtoken = jwt.sign(
        { id: user.id, Username: user.Username },
        process.env.JWT_SIGN_STRING
      );
      res.send({ success: true, authtoken, Username:user.Username });
    } catch (error) {
      res
        .status(500)
        .send({ success: false, errors: ["Internal Server Error"] });
    }
  }
);

//(Route:3) Forgot Password
router.post(
  "/ForgotPassword",
  [body("email", "Enter a valid Email").isEmail().escape()],
  async (req, res) => {
    const errors = validationResult(req);
    //if error exists send bad request
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const email = req.body.email;
    try {
      //try to find user with the email
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .send({ success: false, errors: ["No user found with this Email"] });
      }
      //Send Email to User
      const Passtoken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_PASS_STRING,
        {
          expiresIn: "1h",
        }
      );

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });

      var mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Forgot Password",
        text: `Click on this link to continue: https://banao-mern-ayush.netlify.app/#/resetpassword?token=${Passtoken}`,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.log(`Nodemailer error sending email to ${email}`, error);
      }

      res.send({ success: true, msg: "Check you mail" });
    } catch (error) {
      res
        .status(500)
        .send({ success: false, errors: ["Internal Server Error"] });
    }
  }
);

//(Route:4)  Reset Password
router.post(
  "/ResetPassword",
  [
    body("token", "Invalid Token").isLength({ min: 5 }).escape(),
    body("password", "Invalid Password").isLength({ min: 5 }).escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //if error exists send bad request
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const token = req.body.token;
    const password = req.body.password;

    try {
      const data = jwt.verify(token, process.env.JWT_PASS_STRING);
      let User_id = data.id;
      const user = await User.findById(User_id);
      if (!user) {
        return res
          .status(400)
          .send({ success: false, errors: ["No user found with this Email"] });
      }
      const salt = await bcrypt.genSalt(10);
      const MainPass = await bcrypt.hash(req.body.password, salt);
      const userNewPass = await User.findByIdAndUpdate(
        { _id: User_id },
        { password: MainPass }
      );
      res.send({ success: true, userNewPass });
    } catch (err) {
      res
        .status(500)
        .send({ success: false, errors: ["Internal Server Error"] });
    }
  }
);

module.exports = router;
