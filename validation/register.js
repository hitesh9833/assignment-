const { body } = require("express-validator");

exports.userValidation = [
    body("name")
        .not()
        .isEmpty()
        .withMessage('Name is  required'),

    body("email")
        .not()
        .isEmpty()
        .withMessage('email is  required'),

    body("mobilenumber")
        .not()
        .isEmpty()
        .withMessage('Mobile number is required and  must be  numeric')
        .isLength({ min: 10 })
        .withMessage('Mobile number should have at   least 10 digits'),

    body("password")
        .not()
        .isEmpty()
        .withMessage("Password is required"),
]

