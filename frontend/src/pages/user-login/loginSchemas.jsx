import * as yup from "yup";



export const loginValidationSchema = yup
  .object()
  .test(
    "email-or-phone",
    "Please enter email or phone number",
    function (values) {
      if (!values.email && !values.phoneNumber) {
        return false;
      }
      if (values.phoneNumber && !/^\d{10}$/.test(values.phoneNumber)) {
        return this.createError({
          path: "phoneNumber",
          message: "Phone number must be 10 digits",
        });
      }
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        return this.createError({
          path: "email",
          message: "Invalid email address",
        });
      }  
      return true;
    }
  );



export const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

export const profileValidationSchema = yup.object().shape({
username: yup
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters")

  // Only allowed chars
  .matches(
    /^[a-zA-Z0-9.]+$/,
    "Only letters, numbers and dots are allowed"
  )

  // No consecutive dots
  .matches(
    /^(?!.*\.\.).*$/,
    "Consecutive dots (..) are not allowed"
  )

  // Cannot start or end with dot
  .matches(
    /^(?!\.)(?!.*\.$).*$/,
    "Dot cannot be at start or end"
  )

  // No spaces
  .matches(
    /^\S*$/,
    "Spaces are not allowed"
  )

  // Must contain at least 1 letter
  .matches(
  /[a-zA-Z]/,
  "Must contain at least one letter"
)


  // Auto trim
  .transform(v => v?.trim())

  // Block reserved words
  .notOneOf(
    ["admin", "support", "help", "root", "system"],
    "This username is reserved"
  )

  .required("Username is required"),
  agreed: yup.boolean().oneOf([true], "You must accept terms and conditions"),
});
