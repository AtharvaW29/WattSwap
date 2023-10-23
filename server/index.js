const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const WattSwapSignupModel = require("./models/WattSwap")

const app = express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://127.0.0.1:27017/wattswap", {  useNewUrlParser: true,
useUnifiedTopology: true,})

app.post('/register', (req, res)=> {
    WattSwapSignupModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.post('/login', (req,res) =>{
    const {email, password} = req.body;
    WattSwapSignupModel.findOne({email: email})
    .then(user => {
        if(user) {
            if(user.password === password){
                res.json("Success")
            } else{
                res.json("Password Incorrect")
            }
        } else{
            res.json("No record Exists")
        }
    })
})

app.listen(3001, () => {
    console.log("server running")
})