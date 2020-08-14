function admin(req, res, next) {
  console.log(req.user.user_level);
  if (req.user.user_level != 1)
    return res.status(403).json({ message: 'Access denied.' });
  next();
}

module.exports = admin;
