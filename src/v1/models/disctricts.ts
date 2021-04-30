import mongoose from 'mongoose';

const districtSchema = new mongoose.Schema({
    stateID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'States'
    },
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

districtSchema.index({ id: 1 }, { unique: true })
districtSchema.index({ id: 1, stateID: 1 }, { unique: true })

districtSchema.methods.toJSON = function () {
    const district = this
    const districtObj = district.toObject()
    delete districtObj._id
    delete districtObj.createdAt
    delete districtObj.updatedAt
    return districtObj
}

const Districts = mongoose.model('Districts', districtSchema)

module.exports = Districts