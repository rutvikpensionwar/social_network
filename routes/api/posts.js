const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Posts');

// @route   GET api/posts/test
// @desc    tests posts route
// @access  Public
router.get('/test', (req, res) => {
    res.json({
        message: "Post route works."
    })
});


// @route   POST api/posts
// @desc    create a post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        
});


module.exports = router;