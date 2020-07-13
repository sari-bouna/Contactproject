const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");

// Load Profile model
const Profile = require("../../models/Profile");
// Load Post model
const Post = require("../../models/Post");

// Load validation
const validatePostInput = require("../../validation/post");

// @route GET api/posts/test
// @desc test posts route
// @access  public
router.get("/test", (req, res) => res.json({ msg: "posts works.." }));

// @route GET api/posts
// @desc  GET posts
// @access  public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ nopostsfound: "There is no posts found" })
    );
});

// @route GET api/posts/:id
// @desc  GET posts By ID
// @access  public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err =>
      res.status(404).json({ nopostsfound: "No posts found with that ID " })
    );
});

// @route GET api/posts
// @desc  Create Post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    // check valid
    if (!isValid) {
      // if any errors send 400 status with error object
      return res.status(400).json(errors);
    }

    // create new post
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    // save new post
    newPost.save().then(post => res.json(post));
  }
);

// @route DELTE api/posts/:id
// @desc  Delete  Post
// @access  Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notAuthorized: "User Not Authorized" });
          }
          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: "NO Posts Found" }));
    });
  }
);

// @route post api/posts/like/:id
// @desc  Like   Post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: "user already liked this post" });
          }
          // add user id to likes array
          post.likes.unshift({ user: req.user.id });
          // save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ noPostsFound: "NO posts Found" }));
    });
  }
);

// @route post api/posts/unlike/:id
// @desc  unLike   Post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notLiked: "you have not liked this post yet" });
          }

          // Get Remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          // splice out of likes array

          post.likes.splice(removeIndex, 1);

          //save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ noPostsFound: "NO posts Found" }));
    });
  }
);

// @route post api/posts/comment/:id
// @desc  add comment to post  Post
// @access  Private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    // check valid
    if (!isValid) {
      // if any errors send 400 status with error object
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };
        // add new comment to comment array
        post.comments.unshift(newComment);
        // save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: "NO Posts Found" }));
  }
);

// @route DELETE api/posts/comment/:id/:comment_id
// @desc  delte commment from the post
// @access  Private
router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        // check to see if  comment exist
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentNotExists: "comment does not exists" });
        }

        // Get remove index
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // splice comment out of array
        post.comments.splice(removeIndex, 1);

        //save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postNotFound: "Post Not Found" }));
  }
);

module.exports = router;
