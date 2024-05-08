const Joi = require("joi");
const { errorHandler } = require("../../utils/responseHandler");

const Validators = {
  validExpenseSchema: Joi.object({
    payeeId: Joi.number().integer().positive().required(),
    groupId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().required(),
    description: Joi.string().required(),
    expenseDate: Joi.date(),
    splitType: Joi.string().valid("equally", "unequally").required(),
    sharedBy: Joi.array()
      .items(
        Joi.object({
          userId: Joi.number().integer().positive().required(),
          amount: Joi.number().positive().required(),
        })
      )
      .min(1)
      .required(),
  }),
  validSettleUpSchema: Joi.object({
    payeeId: Joi.number().integer().positive().required(),
    groupId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().required(),
    expenseDate: Joi.date(),
    sharedBy: Joi.array()
      .items(
        Joi.object({
          userId: Joi.number().integer().positive().required(),
          amount: Joi.number().positive().required(),
        })
      )
      .length(1)
      .required(),
  }),
  validUpdateExpenseSchema: Joi.object({
    payeeId: Joi.number().integer().positive(),
    groupId: Joi.number().integer().positive(),
    amount: Joi.number().positive(),
    description: Joi.string(),
    expenseDate: Joi.date(),
    splitType: Joi.string().valid("equally", "unequally"),
    sharedBy: Joi.array()
      .items(
        Joi.object({
          userId: Joi.number().integer().positive().required(),
          amount: Joi.number().positive().required(),
        })
      )
      .min(1),
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
