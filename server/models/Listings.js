const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true
    },
    rate: {
        type: Number,
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
    }
}, {timestamps: true})

//static listing method
listingSchema.statics.listing = async function (user_id, amount, rate, walletAddress) {
    //validation
    if( !amount || !rate || !walletAddress ){
        throw Error('All Fields Must Be Filled!')
    }
    const listing = await this.create({ user_id, amount, rate, walletAddress })

    return listing
}

module.exports = mongoose.model("Listing", listingSchema)