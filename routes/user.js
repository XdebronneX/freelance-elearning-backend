const express = require("express")
const router = express.Router()
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth")
const { registerUser, verifyEmail, loginUser, logoutUser} = require("../controllers/userController");

router.route('/register').post(registerUser);
router.route('/verify/email/:token/:id').get(verifyEmail);
router.route('/login').post(loginUser);
router.route('/logout').get(logoutUser);

module.exports = router;