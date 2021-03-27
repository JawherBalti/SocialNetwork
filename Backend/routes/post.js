const express = require('express')
const router = express.Router()
const postController = require('../controllers/post')
const multer = require('../middleware/multer')
const auth = require('../middleware/auth')
const validate = require('../middleware/input-validation')
const credential = require('../middleware/credentials')

router.post('/', auth, multer, validate.postContent, postController.newPost)
router.get('/', auth, postController.getAllPosts)
router.delete('/:id', auth, validate.id, credential.deletePost, postController.deletePost)
router.post('/like/:id', auth, validate.id, validate.like, postController.likePost)
router.post('/dislike/:id', auth, validate.id, validate.like, postController.dislikePost)


module.exports = router