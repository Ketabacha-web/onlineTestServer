import Joi from "joi";
import { Log } from "../../logger.component.js";

function validateUsernameMiddleware(
  minLength = 3,
  maxLength = 30,
  required = true,
  value = ""
) {
  const schema = Joi.object({
    [value]: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9_]+$"))
      .min(minLength)
      .max(maxLength)
      [required ? "required" : "allow"]("")
      .messages({
        "string.pattern.base": `${value} should not contain space or special characters`,
        "string.empty": `${value} is required!!!`,
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

// module.exports = validateUsernameMiddleware;
export default validateUsernameMiddleware;
