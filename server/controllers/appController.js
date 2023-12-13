const UserProfile = require('../models/Profile')
const mongoose = require('mongoose')



const getHomeData = async (req, res) => {
    console.log("This is the homepage")
    res.status(200)("This is the Homepage")
}


// Get Profile Info
const getProfileData = async (req, res) => {
    const { id } = req.params
    console.log(id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'No such profile!'})
    }

    const userprofile = await UserProfile.findOne(id)

    if(!userprofile) {
        return res.status(404).json({error: 'No such profile'})
    }

    const user_id = userprofile.user_id
    const image = userprofile.image
    const contact = userprofile.contact
    const city = userprofile.city
    const country = userprofile.country
    const state = userprofile.state

    res.status(200).json(user_id, image, contact, city, state, country)
}


// Create Profile Info
const createProfile = async (req, res) => {
    console.log(req.body)
    //saving against the unique user_id    
    try {
        const image = req.file.path
        const contact = req.body.contact
        const city = req.body.city
        const state = req.body.state
        const country = req.body.country
        const user_id = req.body.user_id

        const userprofile = await UserProfile.profile(image, contact, city, state, country, user_id);
        await userprofile.save();
        res.status(200).json(userprofile);
    }catch(errror){
        res.status(400).json({error: errror.message});
    }
}

module.exports = {
    getHomeData,
    getProfileData,
    createProfile
}