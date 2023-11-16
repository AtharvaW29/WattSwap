const mongoose = require("mongoose")
const bcrypt = require('bcrypt')
const validator = require('validator')

const signupSchema = new mongoose.Schema({
    name: {
      type: String,
      required: {
        message: 'Name is required'
      }
    },
    email: {
        type: String,
        required: {
          message: 'Email is required'
        },
        unique: true
      },
    password: {
        type: String,
        required: {
            message: 'Password is required'
          }
    }
})

//static signup method
signupSchema.statics.signup = async function (name, email, password) {
  //validation
  if(!email || !password || !name){
    throw Error('All Fields must be Filled!')
  } 
  if(!validator.isEmail(email)){
    throw Error('Email is not valid')
  }
  if(!validator.isStrongPassword(password)){
    throw Error('Password not strong enough!')
  } 
  
  const exists = await this.findOne({ email })

    if(exists){
        throw Error('Email Already in Use')
    }

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({ name, email, password: hash })

    return user
}

//static login method
signupSchema.statics.login = async function (email, password) {
  if(!email || !password){
    throw Error('All Fields must be Filled!')
  }
  const user = await this.findOne({ email })
  if(!user){
    throw Error('Incorrect Email')
  }
  
  const match = await bcrypt.compare(password, user.password)

  if(!match) {
    throw Error('Incorrect Email or Password')
  }

  return user
}

module.exports = mongoose.model("User", signupSchema)
