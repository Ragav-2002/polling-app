const User = require('../models/userModel')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {validationResult} = require('express-validator')
const userCon = {}

userCon.register = async(req, res)=>{
    const errors = validationResult(req)
    try{
        if(!errors.isEmpty()){
            res.status(400).json(errors.array())
        }else{
            const body = _.pick(req.body, ['username', 'email', 'password'])
            const salt = await bcrypt.genSalt()
            body.password = await bcrypt.hash(body.password, salt)
            const user = new User(body)
            await user.save()
            res.status(400).json({message: 'registered successfully'})
        }
    }
    catch(e){
        res.json(e)
    }
}

userCon.login = async(req, res) => {
    const body = req.body
    const errors = validationResult(req)
    try{
        if(!errors.isEmpty()){
            res.status(400).json(errors.array())
        }
        else{
            const user = await User.findOne({email: body.email})
            if(user){
                if(await bcrypt.compare(body.password, user.password)){
                    const token = jwt.sign({id: user._id}, process.env.SECRET)
                    res.json({token:token})
                }else{
                    res.status(400).json({error: "email / password is incorrect"})
                }
            }else{
                res.status(400).json({error: "email / password is incorrect"})
            }
        }
    }
    catch(e){
        res.status(400).json(e)
    }
}

userCon.createPoll = async(req, res) => {
    
}

module.exports = userCon