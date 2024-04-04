const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    walletAddress: {
        type: String,
        required: true,
    }
}, {timestamps: true})

//static MarketPlace Listing
invoiceSchema.statics.invoice = async function (user_id, amount, price, name, walletAddress) {
    
    const invoice = await this.create({ user_id, amount, price, name, walletAddress })
    return invoice
}

module.exports = mongoose.model("Invoice", invoiceSchema)