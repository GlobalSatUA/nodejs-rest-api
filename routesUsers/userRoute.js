const express = require('express');
const router = express.Router();
const {checkToken} = require('../middleware/checkToken');
const AuthController = require("../controllers/auth");
const jsonParser = express.json();

router.post('/register', jsonParser, AuthController.register);
router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)
router.get('/current', checkToken, AuthController.getCurrentUser)
router.patch('/avatars', checkToken, AuthController.updateAvatar)

router.get('/verify/:verificationToken', AuthController.verificationToken)
router.post('/verify', AuthController.reSendMail)

module.exports = router;