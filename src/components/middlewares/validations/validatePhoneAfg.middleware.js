import Joi from "joi";
import { Log } from "../../logger.component.js";

function validatePhoneAfgMiddleware(
//   minLength = 3,
//   maxLength = 30,
  required = true,
  value = ""
) {
  const schema = Joi.object({
    [value]: Joi.string()
      // .pattern(new RegExp(/^07\d{8}$/))
      .pattern(new RegExp(/^07/))
      .min(10)
      .max(10)
      [required ? "required" : "allow"]("")
      .messages({
        "string.pattern.base": `${value} must start with 07`,
        "string.min": `${value} must be 10 digits long`,
        "string.max": `${value} must be equal to 10 digits long`,
        "string.empty": `${value} is required!!!`,
        "any.required": `${value} is required!!!`,
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

// module.exports = validatePhoneAfgMiddleware;
export default validatePhoneAfgMiddleware;
