const User = require('../models/User')
const Listing = require('../models/Listings')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

//List a new deal
const createListing = async (req, res) => {
    console.log(req.body)

    const amount = req.body.amount
    const rate = req.body.rate
    const accountId = req.body.accountId
    const walletAddress = req.body.walletAddress
    const password = req.body.password
    const user_id = req.body.user_id

    const user = await User.findById(user_id)
    // const match = bcrypt.compare(password, user.password)

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        return res.status(400).json({error: 'No such User'})
      }

    if(!user){
        return res.status(400).json({error: 'No such Profile'})
    }

    // if(!match){
    //     return res.status(400).json({error: 'Incorrect Authentication'})
    // }

    try{
        const listing = await Listing.listing(user_id, amount, rate, accountId, walletAddress);
        res.status(200).json(listing)}
    catch(error){
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    createListing
}