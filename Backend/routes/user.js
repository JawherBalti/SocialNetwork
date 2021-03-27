const express = require('express');
const router = express.Router();
const multer = require("../middleware/multer");
const validate = require('../middleware/input-validation');
const auth = require('../middleware/auth');
const credential = require('../middleware/credentials');
const userController = require('../controllers/user');

router.post("/register", validate.newUser, userController.registerUser);
router.post("/login", validate.login, userController.login);
router.post("/logout", userController.logout);
router.get("/", auth, userController.getAllUsers);
router.get('/findby/:id', auth, validate.id, userController.getOneUser);
router.get('/currentuser', auth, userController.getCurrentUser);
router.put('/password/:id', auth, validate.id, credential.sameUser, validate.changePassword, userController.changePassword);
router.delete('/delete/:id', validate.id, userController.deleteAccount);
router.put("/updateUser/:id", auth, multer, validate.id, credential.sameUser, userController.updateUser);
router.put('/admin/:id', auth, validate.id, validate.adminCredential, credential.isAdmin, userController.changeAdmin);
router.delete('/admin/delete/:id', auth, validate.id, credential.isAdmin, userController.adminDeleteAccount)

module.exports = router;