const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const router = express.Router();


// Load Profile and User Model
const Profile = require('../../models/Profile');
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');
const User = require('../../models/User');

// @route   GET api/profile/test
// @desc    test the profile route
// @access  Public
router.get('/test', (req, res) => {
    res.json({
        message: "Profile route works."
    })
});

// @route   GET api/profile/
// @desc    get current user's profile
// @access  Public
router.get('/', passport.authenticate('jwt', { session: false}),
    (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(400).json(err));
});


// @route   GET api/profile/handle/:handle
// @desc    get particular user's profile
// @access  Public
router.get('/handle/:handle', (req, res) => {
    const errors = {};

    Profile.findOne({ 'handle': req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if(!profile) {
                errors.profile = 'Profile do not exist for such handle';
                return res.status(404).json(errors);
            }
            else {
                res.status(200).json(profile);
            }
        })
        .catch((err) => {
            res.status(404).json({profile: 'There is no profile for such user'});
        })
});


// @route   GET api/profile/all
// @desc    get all user profiles
// @access  Public
router.get('/all', (req, res) =>  {
    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then((profiles) => {
            if(!profiles) {
                errors.profile = 'There are no profiles';
                return res.status(404).json(errors);
            }

            res.json(profiles);
        })
        .catch((err) => {
            res.status(404).json({ 'profile' : 'There are no profiles' });
        })
});


// @route   GET api/profile/user/:id
// @desc    get particular user's profile (by id)
// @access  Public
router.get('/user/:user_id', (req, res) => {
    const errors = {};

    Profile.findOne({ 'user': req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then((profile) => {
            if(!profile) {
                errors.profile = 'Profile do not exist for such handle';
                return res.status(404).json(errors);
            }
            else {
                res.status(200).json(profile);
            }
        })
        .catch((err) => {
            res.status(404).json(err);
        })
});


// @route   POST api/profile/
// @desc    create a user's profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        const profileFields = {};

        const { errors, isValid } = validateProfileInput(req.body);

        if(!isValid) {
            return res.status(400).json(errors);
        }

        profileFields.user = req.user.id;
        if(req.body.handle) profileFields.handle = req.body.handle;
        if(req.body.company) profileFields.company = req.body.company;
        if(req.body.website) profileFields.website = req.body.website;
        if(req.body.location) profileFields.location = req.body.location;
        if(req.body.bio) profileFields.bio = req.body.bio;
        if(req.body.status) profileFields.status = req.body.status;
        if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

        if(typeof(req.body.skills) !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }

        profileFields.social = {};

        if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
        if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

        Profile.findOne({ user: req.user.id })
            .then(profile => {
                if(profile) {
                    Profile.findOneAndUpdate(
                        { user: req.user.id },
                        { $set: profileFields },
                        { new: true })
                        .then(profile => res.json(profile));
                }
                else {


                    Profile.findOne({ handle: profileFields.handle })
                        .then(profile => {
                            if(profile) {
                                errors.handle = 'That handle already exists';
                                res.status(400).json(errors);
                            }

                            new Profile(profileFields).save()
                                .then(profile => res.status(200).json(profile));
                        });
                }
        });
});


// @route   POST api/profile/experience
// @desc    add user's experience
// @access  Private
router.post('/experience', passport.authenticate('jwt', {session: false}),
    (req, res) => {

    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            if(!profile) {
                errors.profile = 'Such profile does not exist';
            }
            else {
                const newExperience = {
                    title       : req.body.title,
                    company     : req.body.company,
                    location    : req.body.location,
                    from        : req.body.from,
                    to          : req.body.to,
                    current     : req.body.current,
                    description : req.body.description
                };

                profile.experience.unshift(newExperience);
                profile.save()
                    .then((profile) => {
                        res.json(profile);
                    });
            }
        })
        .catch((err) => {
            res.status(404).json({ 'education' : 'Please verify the fields' });
        })
});


// @route   DELETE api/profile/experience/:exp_id
// @desc    delete user's experience
// @access  Private
router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}),
    (req, res) => {

        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                // Get remove index

                const removeIndex = profile.experience
                    .map(item => item.id)
                    .indexOf(req.params.exp_id);

                // Splice out of array
                profile.experience.splice(removeIndex, 1);

                // Save
                profile.save()
                    .then((profile) => {
                        res.json(profile);
                    })
                    .catch(err => {
                        res.status(404).json(err);
                    })
            })
            .catch((err) => {
                res.status(404).json({ 'experience' : 'Please verify the fields' });
            })
    });


// @route   POST api/profile/education
// @desc    add user's education
// @access  Private
router.post('/education', passport.authenticate('jwt', {session: false}),
    (req, res) => {

        const { errors, isValid } = validateEducationInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                if(!profile) {
                    errors.profile = 'Such profile does not exist';
                }
                else {
                    const newEducation = {
                        school       : req.body.school,
                        degree     : req.body.degree,
                        fieldofstudy    : req.body.fieldofstudy,
                        from        : req.body.from,
                        to          : req.body.to,
                        current     : req.body.current,
                        description : req.body.description
                    };

                    profile.education.unshift(newEducation);
                    profile.save()
                        .then((profile) => {
                            res.json(profile);
                        });
                }
            })
            .catch((err) => {
                res.status(404).json({ 'experience' : 'Please verify the fields' });
            })
    });


// @route   DELETE api/profile/education/:edu_id
// @desc    delete user's education
// @access  Private
router.delete('/education/:exp_id', passport.authenticate('jwt', {session: false}),
    (req, res) => {

        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                // Get remove index

                const removeIndex = profile.education
                    .map(item => item.id)
                    .indexOf(req.params.exp_id);

                // Splice out of array
                profile.education.splice(removeIndex, 1);

                // Save
                profile.save()
                    .then((profile) => {
                        res.json(profile);
                    })
                    .catch(err => {
                        res.status(404).json(err);
                    })
            })
            .catch((err) => {
                res.status(404).json({ 'education' : 'Please verify the fields' });
            })
    });


// @route   DELETE api/profile/
// @desc    delete user's profile
// @access  Private
router.delete('/', passport.authenticate('jwt', {session: false}),
    (req, res) => {

    Profile.findOneAndRemove({ user: req.user.id })
        .then(() => {
            User.findOneAndRemove({ _id: req.user.id })
                .then(() => {
                    res.json({ success: true })
                });
        });
});

module.exports = router;