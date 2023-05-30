import Joi from "joi";
import { Log } from "../../logger.component.js";

function validatePasswordMiddleware(
//   minLength = 3,
//   maxLength = 30,
//   required = true,
  value = ""
) {
  const schema = Joi.object({
    [value]: Joi.string()
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
      .min(8)
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters long",
      }),
  });

  return (req, res, next) => {
    // console.log(req.body[value]);
    const { error } = schema.validate({ [value]: req.body[value] });

    if (error) {
      return res.status(400).json({
        ValidationErrors: error.details[0].message,
      });
    }

    // const errors = [];
    // if (error) {
    //   errors.push(error.details[0].message);
    // }
    // if (errors.length > 0) {
    //   // send a single response containing all the validation errors
    //   Log.error(errors);
    //   return res.status(400).json({
    //     ValidationErrors: errors,
    //   });
    // }

    next();
  };
}

// module.exports = validatePasswordMiddleware;
export default validatePasswordMiddleware;
