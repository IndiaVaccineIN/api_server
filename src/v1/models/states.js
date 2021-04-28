const mongoose = require('mongoose')

const stateSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    }
    // TODO defined rest of the schema
}, { timestamps: true })

stateSchema.index({ id: 1 }, { unique: true })

stateSchema.methods.toJSON = function () {
    const state = this
    const stateObj = state.toObject()
    delete stateObj._id
    delete stateObj.createdAt
    delete stateObj.updatedAt
    return stateObj
}

const States = mongoose.model('States', stateSchema)

module.exports = States