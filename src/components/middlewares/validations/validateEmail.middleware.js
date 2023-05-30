import Joi from "joi";
import { Log } from "../../logger.component.js";

function validateEmailMiddleware(
//   minLength = 3,
//   maxLength = 30,
  required = true,
  value = ""
) {
  const schema = Joi.object({
    [value]: Joi.string()
      .email({ tlds: { allow: false } })
      [required ? "required" : "allow"]("")
      .messages({
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

// module.exports = validateEmailMiddleware;
export default validateEmailMiddleware;
