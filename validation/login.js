const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (Validator.isEmpty(data.email)) {
    errors.email = "Please Enter Your Email..";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Please Enter Your Password..! ";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid..!";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
