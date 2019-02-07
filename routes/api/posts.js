const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    tests posts route
// @access  Public
router.get('/test', (req, res) => {
    res.json({
        message: "Post route works."
    })
});


// @route   GET api/posts
// @desc    get a post
// @access  Public
router.get('/', (req, res) => {

    const errors = {};

    // sort posts by date
    Post.find()
        .sort({ date: -1 })
        .then((posts) => {
            if(!posts) {
                errors.posts = 'No posts found';
                return res.status(400).json(errors);
            }

            res.json(posts);
        })
        .catch((err) => {
            res.status(404 ).json({ nopostfounds: 'No posts found' });
        });
});


// @route   GET api/posts/:post_id
// @desc    get a post by id
// @access  Public
router.get('/:post_id', (req, res) => {

    const errors = {};

    // sort posts by date
    Post.findById(req.params.post_id)
        .then((post) => {
            if(!post) {
                errors.posts = 'No posts found';
                return res.status(400).json(errors);
            }

            res.json(post);
        })
        .catch((err) => {
            res.status(404 ).json({ nopostfound: 'No post found for the given ID' });
        });
});


// @route   POST api/posts
// @desc    create a post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid) {
         return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.body.id
    });
    newPost.save()
        .then((post) => {
            res.json(post);
        });
});


// @route   DELETE api/posts/:post_id
// @desc    delete a post
// @access  Private
router.delete('/:post_id', passport.authenticate('jwt', { session: false}),
    (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then((profile) => {
            Post.findById(req.params.post_id)
                .then((post) => {

                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized' });
                    }

                    post.remove()
                        .then(() => {
                            res.json({ success: true });
                        })
                })
                .catch((err) => {
                    res.status(400).json(err);
                })
        });


        Post.findByIdAndRemove(req.params.post_id)
            .then(() => {
                res.status(200).json({ message: 'success' });
            })
            .catch((err) => {
                res.status(404).json({ message: 'No such post exist.' });
            });
    });


// @route   POST api/posts/like/:post_id
// @desc    like a post
// @access  Private
router.post('/like/:post_id', passport.authenticate('jwt', { session: false}),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                Post.findById(req.params.post_id)
                    .then((post) => {

                        if(post.likes.filter(like =>
                            like.user.toString() === req.user.id).length > 0) {
                            return res
                                .status(400)
                                .json({ alreadyliked: 'User already liked this post' });
                        }

                        post.likes.unshift({ user: req.user.id });
                        post.save().then((post) => {
                            res.json(post);
                        });

                    })
                    .catch((err) => {
                        res.status(400).json(err);
                    })
            });

    });

// @route   POST api/posts/unlike/:post_id
// @desc    unlike a post
// @access  Private
router.post('/unlike/:post_id', passport.authenticate('jwt', { session: false}),
    (req, res) => {
        Profile.findOne({ user: req.user.id })
            .then((profile) => {
                Post.findById(req.params.post_id)
                    .then((post) => {

                        if(post.likes.filter(like =>
                            like.user.toString() === req.user.id).length === 0) {
                            return res
                                .status(400)
                                .json({ alreadyliked: 'You have not liked this post yet' });
                        }

                        const removeIndex =
                            post.likes
                            .map(item => item.user.toString())
                                .indexOf(req.user.id);

                        post.likes.splice(removeIndex);

                        post.save().then(post => res.json(post));
                    })
                    .catch((err) => {
                        res.status(404).json({ postnotfound: 'No post found'});
                    })
            });

    });


// @route   POST api/posts/comment/:post_id
// @desc    commenting on a post
// @access  Private
router.post('/comment/:post_id', passport.authenticate('jwt', { session: false }),
    (req, res) => {

    console.log('i am in comment');
    const { errors, isValid } = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    Post.findById(req.params.post_id)
        .then((post) => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar
            };

            post.comments.unshift(newComment);

            post.save()
                .then((post) => {
                    res.json(post);
                })
        })
        .catch((err) => {
            res.status(404).json({ nopostfound: 'No post found'});
        });
});


// @route   POST api/posts/uncomment/:post_id/:comment_id
// @desc    uncommenting on a post
// @access  Private
router.delete('/uncomment/:post_id/:comment_id', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validatePostInput(req.body);

        if(!isValid) {
            return res.status(400).json(errors);
        }

        Post.findById(req.params.post_id)
            .then((post) => {
                if(
                    post.comments.filter((comment) =>
                        comment.id.toString() === req.params.comment_id
                ).length === 0) {
                    return res
                        .status(400)
                        .json({ commentnotexist: 'Comment does not exist' });
                }

                const commentIndex = post.comments
                    .map((item) => item._id.toString())
                    .indexOf(req.params.comment_id);

                post.comments.splice(commentIndex, 1);

                post.save()
                    .then((post) => {
                        res.json(post);
                    });
            })
            .catch((err) => {
                res.status(404).json({ nopostfound: 'No post found'});
            });
    });
module.exports = router;