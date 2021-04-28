const mongoose = require('mongoose')

const cvcSchema = new mongoose.Schema({
    state: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true
    },
    cvc: {
        type: String,
        required: true,
        trim: true
    },
    day: { //format "YYYY-MM-DD"
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: Number,
        required: true,
    }
}, { timestamps: true })

cvcSchema.methods.toJSON = function () {
    const cvcDetails = this
    const cvcDetailsObj = cvcDetails.toObject()
    delete cvcDetailsObj._id
    delete cvcDetailsObj.createdAt
    delete cvcDetailsObj.updatedAt
    return cvcDetailsObj
}

const CVCdetails = mongoose.model('cvc_details', cvcSchema)

module.exports = CVCdetails;