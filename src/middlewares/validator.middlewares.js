// import { validationResult } from "express-validator";
// import { ApiError } from "../utils/api-errors.js";

// export const validate = (req, res, next) => {
//   const errors = validationResult(req);

//   // ✅ If errors exist → THROW error
//   if (!errors.isEmpty()) {
//     const extractedError = [];

//     errors.array().forEach((err) => {
//       extractedError.push({
//         [err.path]: err.msg,
//       });
//     });

//     throw new ApiError(422, "Received data is not valid", extractedError);
//   }

//   // ✅ If no errors → continue
//   next();
// };
import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-errors.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      [err.path]: err.msg,
    }));

    throw new ApiError(422, "Received data is not valid", extractedErrors);
  }

  next();
};