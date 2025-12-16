const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send("אין טוקן");

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    //console.log('Decoded token1:', decoded);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send("טוקן לא תקין");
  }
};

module.exports = auth;
