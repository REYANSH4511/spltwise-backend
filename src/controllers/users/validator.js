const Joi = require("joi");
const { errorHandler } = require("../../utils/responseHandler");

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/(?=.*[A-Z])/)
  .pattern(/(?=.*[a-z])/)
  .pattern(/(?=.*[0-9])/)
  .pattern(/(?=.*[!@#$%^&*(),.?":{}|<>])/)
  .required();
const updatePasswordSchema = Joi.string()
  .min(8)
  .pattern(/(?=.*[A-Z])/)
  .pattern(/(?=.*[a-z])/)
  .pattern(/(?=.*[0-9])/)
  .pattern(/(?=.*[!@#$%^&*(),.?":{}|<>])/);

const Validators = {
  signUpUserValid: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    mobileNo: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    email: Joi.string().email().required(),
    password: passwordSchema,
  }),
  loginUserValid: Joi.object({
    email: Joi.string().email().required(),
    password: passwordSchema,
  }),
  updateUserValid: Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    mobileNo: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/),
    email: Joi.string().email(),
    password: updatePasswordSchema,
  }),
  usersListValid: Joi.object({
    firstName: Joi.string(),
    mobileNo: Joi.string().pattern(/^[0-9]+$/),
    email: Joi.string(),
  }),
};

module.exports = Validators;

function Validator(func) {
  return async function Validator(req, res, next) {
    try {
      const validated = await Validators[func].validateAsync(req.body, {
        abortEarly: false,
      });
      req.body = validated;
      next();
    } catch (err) {
      let _er = {};
      if (err.isJoi) {
        err.details.forEach((d) => {
          let _key = d.context.key;
          _er[_key] = d.message;
        });
      }
      await next(
        errorHandler({
          res,
          statusCode: 400,
          message: _er,
        })
      );
    }
  };
}

module.exports = Validator;
