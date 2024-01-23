const User = require('../models/userModel')
const nameSchema = {
    notEmpty: {
        errorMessage: 'username cannot be empty'
    },
    isLength:{
        options:{min:3},
        errorMessage: 'username should be at least 3 characters'
    }
}
const emailSchema = {
    notEmpty: {
        errorMessage: 'email cannot be empty'
    },
    isEmail:{
        errorMessage: 'invalid email'
    }
}
const passwordSchema = {
    notEmpty:{
        errorMessage: 'password cannot be empty'
    },
    isLength:{
        options:{min:8, max:128}
    }
}
const dateSchema = {

}
const registerSchema = {
    username: nameSchema,
    email: emailSchema,
    password: passwordSchema,
}
const loginSchema = {
    email: emailSchema,
    password: passwordSchema
}

module.exports = {registerSchema, loginSchema}