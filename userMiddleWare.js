const jwt = require("jsonwebtoken");
//middleware to get user information with the token
const getuser = (req, res, next) => {
  const token = req.header("authtoken");
  if (!token) {
    res.status(401).send({success:false, errors: ["Invalid User"] });
  }
  try {
    const data = jwt.verify(token, process.env.JWT_SIGN_STRING);
    req.userId = data.id;
    req.Username = data.Username;
    next();
  } catch (error) {
    res.status(401).send({success:false, errors: ["Invalid User"] });
  }
};
module.exports = getuser;
