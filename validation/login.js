const Validator = require("validator");
const isEmpty = require("is-empty");
module.exports = function validateLoginInput(data) {
  let errors = {};
// Convert empty fields to an empty string so we can use validator functions
  data.email = !isEmpty(data.id) ? data.id : "";
  data.password = !isEmpty(data.pin) ? data.pin : "";
// Email checks
  // if (Validator.isEmpty(data.email)) {
  //   errors.email = "Email field is required";
  // } else if (!Validator.isEmail(data.email)) {
  //   errors.email = "Email is invalid";
  // }
// Password checks
  if (Validator.isEmpty(data.pin)) {
    errors.password = "Password field is required";
  }
return {
    errors,
    isValid: isEmpty(errors)
  };
};
