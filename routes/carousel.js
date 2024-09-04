const express = require("express")
const router = express.Router()
const upload = require("../utils/multerImg");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
const { createCarousel, updateCarousel, getCarouselDetails, reOrderingCarousel, setDefaultCarousel, getCarousel } = require("../controllers/carouselController")
router.post('/new/carousel', isAuthenticatedUser, authorizeRoles("admin"), upload.array("images"), createCarousel);
router.put('/update/carousel/:id', isAuthenticatedUser, authorizeRoles("admin"), upload.array("images"), updateCarousel);
router.put('/reorder/carousel/:id', isAuthenticatedUser, authorizeRoles("admin"), reOrderingCarousel);
router.put('/setDefault/:id', isAuthenticatedUser, authorizeRoles("admin"), setDefaultCarousel);
router.get('/singleCarousel/:id', isAuthenticatedUser, authorizeRoles("admin"), getCarouselDetails);
router.get('/allCarousel', getCarousel);

module.exports = router;