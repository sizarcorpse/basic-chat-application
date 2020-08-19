const Joi = require("@hapi/joi");

const signupValidation = (data) => {
  const mySchema = Joi.object({
    username: Joi.string().min(4).required(),
    email: Joi.string().min(6).email().required(),
    password: Joi.string().min(6),
  });

  return mySchema.validate(data);
};

const loginValidation = (data) => {
  const mySchema = Joi.object({
    email: Joi.string().min(6).email().required(),
    password: Joi.string().min(6),
  });

  return mySchema.validate(data);
};
module.exports.signupValidation = signupValidation;
module.exports.loginValidation = loginValidation;
