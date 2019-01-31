const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const router = express.Router();
const User = require('../../models/User');
const keys = require('../../config/keys');

const validateRegisterInput = require('../../validation/register');

// @route   GET api/users/test
// @desc    tests user route
// @access  Public
router.get('/test', (req, res) => {
    res.json({
        message: "User route works."
    })
});

// @route   POST api/users/register
// @desc    register a user
// @access  Public
router.post('/register', (req, res) => {

    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
            }
            else {

                const avatar = gravatar.url(req.body.email, {
                    s: '200', // Size
                    r: 'pg', // Rating
                    d: 'mm' // Default
                });

                const newUser = new User({
                    email: req.body.email,
                    password: req.body.password,
                    name: req.body.name,
                    avatar: avatar
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                });
            }
    })
});

// @route   POST api/users/login
// @desc    login the user / return a token
// @access  Public
router.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email })
        .then(user => {
            if(!user) {
                return res.status(400).json({
                    email: "User not found"
                });
            }
            else {
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if(isMatch) {
                            // return res.status(200).json({
                            //     message: "Login successful"
                            // });

                            // implementing JWT token
                            const payload = {
                                id: user.id, name: user.name, avatar: user.avatar
                            };

                            jwt.sign(
                                payload,
                                keys.secretOrKey,
                                { expiresIn: 3600 },
                                (err, token) => {
                                    res.json({
                                        success: true,
                                        token: 'Bearer ' + token
                                    });
                                });
                        }
                        else {
                            return res.status(400).json({
                                password: "Password incorrect"
                            });
                        }
                    });
            }
        });
});


// @route   GET api/users/current
// @desc    get the current logged in user
// @access  Private
router.get('/current',
    passport.authenticate('jwt', {session: false}),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
});

module.exports = router;