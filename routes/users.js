const router = require('express').Router()
const verify = require('./middlewares/verifyToken')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

// UPDATE
router.put('/:_id', verify, async (req, res) => {
  if (req.params._id === req.user._id || req.user.isAdmin) {
    console.log(req.user._id)
    // Hash password
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSaltSync(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
      } catch (err) {
        return res.status(500).send(err)
      }
    }

    try {
      await User.findByIdAndUpdate(req.params._id, {
        $set: req.body
      })
      res.status(200).send('Account has been updated')
    } catch (err) {
      return res.status(500).send(err)
    }

  } else {
    console.log(req.body._id)
    return res.status(403).send("Only update your account")
  }
})

// DELETE
router.delete('/:_id', verify, async (req, res) => {
  if (req.user._id === req.params._id || req.user.isAdmin) {
    try {
      await User.findByIdAndDelete({ _id: req.params._id })
      res.status(200).send("Account has been deleted")
    } catch (err) {
      return res.status(500).send(err)
    }
  } else {
    return res.status(403).send("You can only delete your account!")
  }
})

// GET
router.get('/:_id', verify, async(req, res) => {
  try {
    const user = await User.findById(req.params._id)
    const { password, updatedAt, createdAt, ...other } = user._doc
    res.status(200).send(other)
  } catch (err) {
    res.status(500).send(err)
  }
})

// Follow user
router.put('/:_id/follow', verify, async (req, res) => {
  if (req.user._id !== req.params._id) {
    try {
      const user = await User.findById(req.params._id)
      const currentUser = await User.findById(req.user._id)
      if (!user.followers.includes(currentUser._id)) {
        await user.updateOne({ $push: {followers: currentUser._id}})
        await currentUser.updateOne({ $push: {followings: user._id}})
        res.status(200).send('User has been followed')
      } else {
        res.status(403).send('Already follow this user')
      }
    } catch (err) {
      res.status(500).send(err)
    }

  } else {
    res.status(403).send("Cannot follow yourself")
  }
})


// Unfollow user
router.put('/:_id/unfollow', verify, async (req, res) => {
  if (req.user._id !== req.params._id) {
    try {
      const user = await User.findById(req.params._id)
      const currentUser = await User.findById(req.user._id)
      if (currentUser.followings.includes(user._id)) {
        await user.updateOne({ $pull: {followers: currentUser._id}})
        await currentUser.updateOne({ $pull: {followings: user._id}})
        res.status(200).send('User has been unfollowed')
      } else {
        res.status(403).send('Already unfollow this user')
      }
    } catch (err) {
      res.status(500).send(err)
    }

  } else {
    res.status(403).send("Cannot unfollow yourself")
  }
})

module.exports = router