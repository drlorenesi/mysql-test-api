const _ = require('lodash');

module.exports = (validator) => {
  return (req, res, next) => {
    if (_.isEmpty(req.body))
      return res.status(400).json({ error: 'No info provided...' });
    const { error } = validator(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    next();
  };
};
