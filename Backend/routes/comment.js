const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment');
const auth = require('../middleware/auth');
const validate = require('../middleware/input-validation');
const credential = require('../middleware/credentials')

router.post('/:id', auth, validate.id, validate.comment, commentController.createComment)
router.get('/:id', auth, validate.id, commentController.getCommentsofPost)
router.delete('/:id', auth, validate.id, credential.deleteComment, commentController.deleteComment)
router.delete('/allComments/:id', auth, validate.id, commentController.deleteAllComments)

module.exports = router;