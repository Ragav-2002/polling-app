const _ = require('lodash')
const { Error } = require('mongoose')
const pollSchema = {
    question: {
        notEmpty: {
            errorMessage: 'this field cannot be empty'
        }
    },
    options:{
        isArray:{
            bail: true,
            options: {
                min: 4,
                max: 4
              },
              errorMessage: 'invalid syntax / wrong no of options (must be 4 options)'
        },
    },
    "options.*.optionText":{
        notEmpty:{
            errorMessage: 'optionText is empty/invalid field name'
        }
    },
    expiryDate: {
        notEmpty:{
            errorMessage: 'you must specify expiryDate'
        }
    }
}
module.exports = {pollSchema}