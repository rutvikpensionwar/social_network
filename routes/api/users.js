const express = require('express');
const router = express.Router();

// @route   GET api/users/test
// @desc    tests post route
// @access  Public
router.get('/test', (req, res) => {
    res.json({
        message: "User route works."
    })
});

module.exports = router;