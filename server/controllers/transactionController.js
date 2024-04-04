const User = require('../models/User')
const Listing = require('../models/Listings')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const MarketPlace = require('../models/MarketPlace')
const Invoice = require('../models/Invoice')

//List a new deal
const createListing = async (req, res) => {
    const amount = req.body.amount
    const rate = req.body.rate
    const walletAddress = req.body.walletAddress
    const password = req.body.password
    const user_id = req.body.user_id

    // const match = bcrypt.compare(password, user.password)

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({error: 'No such User'})
    }

    const user = await User.findById(user_id)  

    if(!user){
        return res.status(400).json({error: 'No such Profile'})
    }

    // if(!match){
    //     return res.status(400).json({error: 'Incorrect Authentication'})
    // }

    try{
        const marketPlaceListing = await Listing.listing(user_id, amount, rate, walletAddress);
        await marketPlaceListing.save();
        res.status(200).json(marketPlaceListing);
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

//fetch deals listed by the user
const getListings = async (req, res) => {
    const user_id = req.params.user_id

    const listings = await Listing.find({user_id: user_id}).sort({createdAt: -1})

    res.status(200).json(listings)
}

//delete a deal listed by the user
const deleteListing = async (req, res) => {
    const id = req.params._id

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such Listing'})
      }

    const marketPlaceListing = await Listing.findByIdAndDelete(id)

    if(!marketPlaceListing){
        res.status(400).json({error: 'No Such Listing'})
    }

    res.status(200).json(marketPlaceListing)
}

//add to marketplace
const addToMarketPlace = async (req, res) => {
        const user_id = req.body.user_id
        const amount = req.body.amount
        const rate = req.body.rate
        const name = req.body.name
        const walletAddress = req.body.walletAddress


        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({error: 'No such User'})
        }
    
        const user = await User.findById(user_id)  
    
        if(!user){
            return res.status(400).json({error: 'No such Profile'})
        }

        try{
            const marketPlaceListing = await MarketPlace.marketPlaceListing(user_id, amount, rate, name, walletAddress);
            await marketPlaceListing.save();
            res.status(200).json(marketPlaceListing);
        }
        catch(error){
            res.status(400).json({error: error.message})
        }

}

// get all deals from MarketPlace
const getMarketPlaceDeals = async (req, res) => {

    const marketPlaceListings = await MarketPlace.find({})
  
    res.status(200).json(marketPlaceListings)
}

// get user registered deals from MarketPlace
const getUserMarketPlaceDeals = async (req, res) => {
    const user_id = req.params.user_id

    const userMarketPlaceListings = await MarketPlace.find({user_id: user_id}).sort({createdAt: -1})

    res.status(200).json(userMarketPlaceListings)
}

// delete a listed deal from MarketPlace
const deleteMarketPLaceListing = async (req, res) => {
    const id = req.params._id

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such Listing'})
      }

    const marketPlaceListing = await MarketPlace.findByIdAndDelete(id)

    if(!marketPlaceListing){
        res.status(400).json({error: 'No Such Listing'})
    }

    res.status(200).json(marketPlaceListing)
}

// Create an Invoice
const createInvoice = async (req, res) => {
    const user_id = req.body.user_id
    const amount = req.body.amount
    const price = req.body.rate
    const name = req.body.name
    const walletAddress = req.body.walletAddress

    try{
        const invoice = await Invoice.invoice(user_id, amount, price, name, walletAddress);
        await invoice.save();
        res.status(200).json(invoice);
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

// Fetch a single Invoice
const getInvoices = async(req, res) => {
    const user_id = req.params.user_id

    const invoice = await Invoice.find({user_id: user_id}).sort({createdAt: -1})

    if(!invoice){
        return res.status(404).json({error: 'No such Invoice!'})
    }

    res.status(200).json(invoice)
}



module.exports = {
    createListing,
    getListings,
    deleteListing,
    addToMarketPlace,
    getMarketPlaceDeals,
    getUserMarketPlaceDeals,
    deleteMarketPLaceListing,
    createInvoice,
    getInvoices
}