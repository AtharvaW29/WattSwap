const express = require("express")
const router = express.Router()
const requireAuth = require("../middleware/requireAuth")
const upload = require("../middleware/uploadFile")
const { 
    getHomeData,
    getProfileData,
    createProfile,
    updateProfile
    } = require("../controllers/appController")

const {
    createListing,
    getListings,
    deleteListing,
    addToMarketPlace,
    getMarketPlaceDeals,
    getUserMarketPlaceDeals,
    deleteMarketPLaceListing,
    createInvoice,
    getInvoices
} = require("../controllers/transactionController")

//using auth for the following
router.use(requireAuth)

//Get the home-page data
router.get('/home', getHomeData)

// Create/Edit the Profile
router.post('/profile/edit', upload.single('image'), createProfile)

//Get the profile data
router.get('/profile/:user_id', getProfileData)

//Update Profile data
router.patch('/profile/edit/:user_id', upload.single('image'), updateProfile)

// Transaction Routes

// Deal Listing
router.post('/transaction/listing', createListing)

//Get Deals
router.get('/transaction/deals/:user_id', getListings)

//Delete Deals
router.delete('/transaction/deals/:_id', deleteListing)

//Add to MarketPlace
router.post('/marketplace', addToMarketPlace)

//Fetch all deals from MarketPlace
router.get('/marketplace', getMarketPlaceDeals)

// Fetch only deals listed by user
router.get('/marketplace/:user_id', getUserMarketPlaceDeals)

// Delete a MarketPlaceListing
router.delete('/marketplace/:_id', deleteMarketPLaceListing)

// Create an Invoice
router.post('/invoice', createInvoice)

// Get an Invoice
router.get('/invoice/:user_id', getInvoices)

module.exports = router