const Joi = require("joi");
const { errorHandler } = require("../../utils/responseHandler");

const Validators = {
  validCreateGroupSchema: Joi.object({
    groupName: Joi.string().required(),
    groupMembers: Joi.array()
      .items(Joi.number().integer().positive())
      .min(2)
      .required(),
  }),
  validUpdateGroupSchema: Joi.object({
    groupName: Joi.string(),
    groupMembers: Joi.array().items(Joi.number().integer().positive()).min(2),
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
