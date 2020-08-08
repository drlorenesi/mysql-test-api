const Joi = require('joi');

// Validation function
function validateUser(user) {
  const schema = Joi.object({
    first_name: Joi.string()
      .regex(/^[a-zA-Z\p{L} /'.-]{3,45}$/u)
      .required(),
    last_name: Joi.string()
      .regex(/^[a-zA-Z\p{L} /'.-]{3,45}$/u)
      .required(),
    email: Joi.string().email().required(),
    password: Joi.string().alphanum().min(5).required(),
    registration_date: Joi.date(),
    modified: Joi.date(),
  });
  return schema.validate(user);
}

module.exports = validateUser;
