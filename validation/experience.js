const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateExperienceInput(data) {

    let errors = {};

    data.title = !isEmpty(data.title) ? data.title : '';
    data.company = !isEmpty(data.company) ? data.company : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    data.to = !isEmpty(data.to) ? data.to : '';
    data.description = !isEmpty(data.description) ? data.description : '';

    if (Validator.isEmpty(data.title)) {
        errors.title = 'Job title is invalid';
    }

    if (Validator.isEmpty(data.company)) {
        errors.company = 'Company name is invalid';
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