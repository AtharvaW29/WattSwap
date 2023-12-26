const mongoose = require('mongoose')

const marketPlaceSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        unique: true
    },
    rate: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {timestamps: true})

//static MarketPlace Listing
marketPlaceSchema.statics.marketPlaceListing = async function (user_id, amount, rate, name) {
    
    if(!user_id || !amount || !rate || !name) {
        throw Error("All Fields Must be Filled")
    }
    if(amount == this.findOne(amount)){
        throw Error("No Duplicate Deals")
    }

    const marketListing = await this.create({ user_id, amount, rate, name })
    return marketListing
}

module.exports = mongoose.model("MarketPlace", marketPlaceSchema)