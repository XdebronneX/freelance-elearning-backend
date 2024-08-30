const express = require("express")
const router = express.Router()
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth")
const { registerUser, verifyEmail, loginUser, getProfile, updatePassword, updateProfile, forgotPassword, resetPassword, logoutUser} = require("../controllers/userController");
const upload = require("../utils/multerImg");

router.route('/register').post(registerUser);
router.route('/verify/email/:token/:id').get(verifyEmail);
router.route('/login').post(loginUser);
router.get('/me', isAuthenticatedUser, getProfile);
router.put('/me/changePassword', isAuthenticatedUser, updatePassword);
router.put('/me/update', isAuthenticatedUser, upload.single('avatar'), updateProfile);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/logout').get(logoutUser);

module.exports = router;