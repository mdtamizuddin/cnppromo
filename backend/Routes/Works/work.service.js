const Work = require("./work.model");

const createWork = async (data) => {
    try {
        const work = new Work(data);
        await work.save();
        return work;
    } catch (error) {
        throw new Error(error)
    }
}
// get All Works
const getAllWork = async (params) => {
    try {
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 20;
        const skip = (page - 1) * limit;
        const filters = {};
        if (params.category && params.category !== "all") {
            filters.category = params.category
        }
        const works = await Work.find(filters)
            .skip(skip)
            .limit(limit);
        const total = await Work.countDocuments();
        return {
            works,
            total,
            page,
            pages: Math.ceil(total / limit)
        }
    } catch (error) {
        throw new Error(error)
    }
}
// get SIngle Work
const getSingleWork = async (id) => {
    try {
        const work = await Work.findById(id);
        return work
    } catch (error) {
        throw new Error(error)
    }
}
// update a work

const updateWork = async (id, data) => {
    try {
        const work = await Work.findByIdAndUpdate(id, data, { new: true });
        return work
    } catch (error) {
        throw new Error(error)
    }
}
const deleteWork = async (id) => {
    try {
        const work = await Work.findByIdAndDelete(id);
        return work
    } catch (error) {
        throw new Error(error)
    }
}
module.exports = {
    createWork,
    getAllWork,
    getSingleWork,
    updateWork,
    deleteWork
}