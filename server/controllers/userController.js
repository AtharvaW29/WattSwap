const User = require('../models/User')
const jwt = require('jsonwebtoken')

const secret = 'wattswappforsustainableenrgyandcleanfuture';

const createToken = (_id) =>{
    return jwt.sign({_id}, secret, { expiresIn: '2d' });
}

// login user
const loginUser = async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.login(email, password);

        //create a token
        const token = createToken(user._id);
        const name = user.name
        const user_id = user._id
        res.status(200).json({email, token, name, user_id})
    }catch (error){
        res.status(400).json({error: error.message})
    }
}
// signup user
const signupUser = async (req, res) => {
    const {name, email, password} = req.body

    try {
        const user = await User.signup(name, email, password);

        //create a token
        const token = createToken(user._id);
        const user_id = user._id
        res.status(200).json({email, token, name, user_id})
    }catch (error){
        res.status(400).json({error: error.message})
    }
}


module.exports = { signupUser, loginUser }