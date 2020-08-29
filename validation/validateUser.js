const Joi = require('joi');

// Validation function
module.exports = (user) => {
  const schema = Joi.object({
    first_name: Joi.string()
      .regex(/^[a-zA-Z\p{L} /'.-]{3,45}$/u)
      .required(),
    last_name: Joi.string()
      .regex(/^[a-zA-Z\p{L} /'.-]{3,45}$/u)
      .required(),
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().min(5).required(),
    user_level: Joi.number().integer().min(0).max(9),
  });
  return schema.validate(user);
};
