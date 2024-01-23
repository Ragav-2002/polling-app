const Poll = require('../models/pollModel')
const Vote = require('../models/vote')
const User = require('../models/userModel')
const _ = require('lodash')
const {validationResult} = require('express-validator')
const pollCon = {}
pollCon.create = async(req, res)=>{
    const obj = _.pick(req.body, ['question', 'options', 'expiryDate'])
    const body = {...obj, creator: req.id}
    const errors = validationResult(req)
    try{
        if(!errors.isEmpty()){
            res.status(400).json({errors: errors.array()})
        }else{
            const poll = new Poll(body)
            await poll.save()
            await User.findByIdAndUpdate(poll.creator, {$push:{pollsCreated: poll._id}})
            res.json({
                message: 'poll created successfully',
                pollId: poll._id
            })
        }
    }
    catch(e){
        res.status(400).json(e)
    }
}
pollCon.getPoll = async(req, res)=>{
    const id = req.params.id
    try{
        const poll = await Poll.findById(id)
        res.json({Question: poll.question,Options: poll.options, endDate: poll.expiryDate})
    }catch(e){
        res.status(400).json(e)
    }
}

pollCon.edit = async(req, res)=> {
    const id = req.params.id
    const body = _.pick(req.body,['question','options'])
    try{
        const poll = await Poll.findOneAndUpdate({_id: id, creator: req.id},body, {new: true})
        res.json({message: 'poll updated'})
    }catch(e){
        res.status(400).json(e)
    }
}

pollCon.destroy = async(req, res)=> {
    const id = req.params.id
    try{
        const poll = await Poll.findOneAndDelete({_id: id, creator: req.id})
        res.json({message: 'poll deleted'})
    }catch(e){
        res.status(400).json(e)
    }
}

pollCon.vote = async(req, res)=>{
    const id = req.params.id
    const body = _.pick(req.body, ['option'])
    try{
        const poll = await Poll.findById(id)
        const oId = poll.options.find(ele =>{
            return ele.optionText == body.option
        })
        if(!oId){
            return res.status(400).json({message: 'invalid option name'})
        }
        else if(req.id == poll.creator){
            return res.status(401).json({error: 'you cannot vote on your own poll'})
        }else if(await Vote.findOne({userId: req.id})){
            return res.status(401).json({error: 'you cannot vote multiple times on same poll'})
        }else{
            const vote = new Vote(body)
            vote.userId = req.id
            vote.pollId = id
            vote.optionId = oId._id
            await vote.save()
            res.json({message: 'vote recorded'})
        }
    }
    catch(e){
        res.status(400).json(e)
    }
}
pollCon.list = async(req, res) => {
    const polls = await Poll.find()
    console.log(polls)
    try{
        const pollsData = polls.filter(ele => {
            return new Date(ele.expiryDate).valueOf() >= new Date().valueOf()
        })
        const response = pollsData.map(poll => {
            const obj = _.pick(poll, ["question", "options","expiryDate"])
            return obj
        })
        res.json(response)
    }
    catch(e){
        res.status(400).json(e)
    }
}

pollCon.show = async(req, res) => {
    const polls = await Poll.find({creator: req.id})
    try{
        res.json({polls: polls})
    }
    catch(e){
        res.status(400).json(e)
    }
}

pollCon.results = async(req, res)=>{
    try{
        const obj = {}
        const id = req.params.id
        const poll = await Poll.findById(id)
        const votes = await Vote.find({pollId: id})
        for(const vote of votes){
            for(const op of poll.options){
                if(vote.optionId.equals(op._id)){
                    console.log(op.optionText)
                    if(obj.hasOwnProperty(op.optionText)){
                        obj[op.optionText] += 1
                    }else{
                        obj[op.optionText] = 1
                    }
                }else{
                    obj[op.optionText] = 0
                }
            }
        }
        res.json({pollId: id, question: poll.question,voteResults: obj})
    }
    catch(e){
        res.status(400).json(e)
    }
}

pollCon.search = async(req, res)=>{
    const qus = req.query.qus
    try{
        const polls = await Poll.find()
        const results = polls.filter(poll=>poll.question.includes(qus))
        res.json({polls: results})
    }
    catch(e){
        res.status(400).json(e)
    }
}

module.exports = pollCon