import Joi from "joi";
import { Log } from "../../logger.component.js";

function validateNumberMiddleware(
  minLength = 3,
  maxLength = 30,
  required = true,
  value = ""
) {
  const schema = Joi.object({
    [value]: Joi.number()
      .min(minLength)
      .max(maxLength)
      [required ? "required" : "allow"]("")
      .messages({
        "any.required": `${value} is required!!!`,
        "number.base": `${value} is required!!!`,
        "number.empty": `${value} is required!!!`,
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

// module.exports = validateNumberMiddleware;
export default validateNumberMiddleware;
