const express = require("express")
const router = express.Router()
const upload = require("../utils/multerImg");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { createCustomization, getCustomDesign, updateCustomization,reOrderingCustomization } = require("../controllers/customizationController")
router.post('/new/customization', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'imgSec' }, { name: 'imgTwo' }, { name: 'singleVideo' }]), createCustomization);
router.get('/allDesign', getCustomDesign);
router.put('/update/data/:id', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'imgSec' }, { name: 'imgTwo' }, { name: 'singleVideo' }]), updateCustomization);
router.put('/reorder/ui/:id', isAuthenticatedUser, authorizeRoles("admin"), upload.fields([{ name: 'imgSec' }, { name: 'imgTwo' }, { name: 'singleVideo' }]), reOrderingCustomization);
module.exports = router;