const mongoose = require('mongoose')
const validator = require('validator')

const profileSchema = new mongoose.Schema({

        image: {
            type: String,
            required: true,
        },
        contact: {
            type: String,
            required: true,
            unique: true
        },

        city: {
                type: String,
                required: true
        },
        state: {
                type: String,
                required: true
        },
        country: {
                type: String,
                required: true
        },
        user_id: {
            type: String,
            required: true,
            unique: true
        }
}, {timestamps: true})

//staic profile management methods
profileSchema.statics.profile = async function(image, contact, city, state, country, user_id) {
    //validation
    if(!image || !contact || !city || !state || !country){
        throw Error('All Fields Must be Filled')
    }
    if(!validator.isMobilePhone(contact)){
        throw Error('Invalid Mobile Number')
    }
    const exists = await this.findOne({ contact })
        if(exists){
            throw Error('Number Already in Use')
        }
    const userprofile = await this.create({ image, contact, city, state, country, user_id })

    return userprofile
}

module.exports = mongoose.model("UserProfile", profileSchema)