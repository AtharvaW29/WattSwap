const UserProfile = require('../models/Profile')
const mongoose = require('mongoose')



const getHomeData = async (req, res) => {
    console.log("This is the homepage")
    res.status(200)("This is the Homepage")
}


// Get Profile Info
const getProfileData = async (req, res) => {
    const authHeader   = req.params.user_id

    const token = authHeader
        
    if (!mongoose.Types.ObjectId.isValid(token)) {
        return res.status(404).json({error: 'No such User'})
      }

    const userprofile = await UserProfile.findOne({user_id: token})

    if(!userprofile) {
        return res.status(404).json({error: 'No such profile'})
    }

    res.status(200).json(userprofile)
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

// Update Profile Info
const updateProfile = async (req, res) => {
    const { token } = req.params.user_id

    if(!mongoose.Types.ObjectId.isValid(token)) {
        return res.status(404).json({error: 'No Such Profile!'})
    }

    const userprofile = await UserProfile.findOneAndUpdate({user_id: token}, {
        ...req.body
    })

    if(!userprofile){
        res.status(404).json({error: 'No Such User Profile'})
    }

    res.status(200).json(userprofile)
}

module.exports = {
    getHomeData,
    getProfileData,
    createProfile,
    updateProfile
}