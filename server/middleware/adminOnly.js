const adminOnly = (req, res, next) => {
  console.log(`Admin check for user: ${ req.user.role}`);
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).send('אין הרשאה לבצע פעולה זו');
  }
  next();
};

module.exports = adminOnly;
