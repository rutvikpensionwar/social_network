const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateEducationInput(data) {

    let errors = {};

    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    data.to = !isEmpty(data.to) ? data.to : '';
    data.description = !isEmpty(data.description) ? data.description : '';

    if (Validator.isEmpty(data.school)) {
        errors.school = 'School is invalid';
    }

    if (Validator.isEmpty(data.degree)) {
        errors.degree = 'Degree name is invalid';
    }

    if (Validator.isEmpty(data.fieldofstudy)) {
        errors.fieldofstudy = 'Field of Study is invalid';
    }

    if (Validator.isEmpty(data.from)) {
        errors.from = 'From date is invalid';
    }

    if (Validator.isEmpty(data.to)) {
        errors.to = 'To date is invalid';
    }

    if (Validator.isEmpty(data.description)) {
        errors.description = 'Description is invalid';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
};