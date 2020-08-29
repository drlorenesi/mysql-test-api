module.exports = (req, res, next) => {
  if (req.user.user_level != 1)
    return res.status(403).json({ message: 'Access denied.' });
  next();
};
