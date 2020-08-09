function admin(req, res, next) {
  if (req.user.user_level != 1) return res.status(403).send('Access denied.');
  next();
}

module.exports = admin;
