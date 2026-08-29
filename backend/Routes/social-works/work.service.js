
const { Work, WorkSubmit } = require('./work.model');
const User = require('../User/user.model');
const createWork = async (workData) =>
{
    try {
        const work = new Work(workData);
        await work.save();
        return work;
    } catch (error) {
        throw new Error('Error creating work: ' + error.message);
    }
}
const createWorkSubmit = async (workSubmitData) =>
{
    try {
        const workSubmit = new WorkSubmit(workSubmitData);
        await workSubmit.save();
        await Work.findByIdAndUpdate(workSubmit.workId, { $push: { workers: workSubmitData.userId } })
        return workSubmit;
    } catch (error) {
        throw new Error('Error creating work submit: ' + error.message);
    }
}
const completeWorkSubmit = async (workSubmitId, status) =>
{
    try {
        const workSubmit = await WorkSubmit.findById(workSubmitId)
            .populate('workId')

        if (!workSubmit) {
            throw new Error('Work submit not found');
        }

        // Flip the status first, and only if it is still pending. A second
        // approval would otherwise credit the reward all over again.
        const updatedWorkSubmit = await WorkSubmit.findOneAndUpdate(
            { _id: workSubmitId, status: { $ne: "completed" } },
            { status: "completed" },
            { new: true }
        );
        if (!updatedWorkSubmit) {
            throw new Error('This submission has already been approved');
        }

        const price = workSubmit.workId?.price || 0;
        if (price > 0) {
            await User.findByIdAndUpdate(workSubmit.userId, {
                $inc: { balance: price }
            }, { new: true });
        }
        return updatedWorkSubmit;
    }
    catch (error) {
        throw new Error('Error completing work submit: ' + error.message);
    }
}
const getWorkById = async (workId) =>
{
    try {
        const work = await Work.findById(workId);
        if (!work) {
            throw new Error('Work not found');
        }
        return work;
    }
    catch (error) {
        throw new Error('Error fetching work: ' + error.message);
    }
}
const getAllWorks = async (user) =>
{
    try {
        const userRes = await User.findById(user);
        if (!userRes) throw new Error('User not found');
        if (userRes.role === 'admin') {
            const works = await Work.find()
                .sort({ status: 1, createdAt: -1 })
                .select('-workers');

            const submits = await WorkSubmit.aggregate([
                { $match: { status: 'pending' } },
                {
                    $group: {
                        _id: '$workId',
                        count: { $sum: 1 }
                    },
                },
            ]);

            const worksWithSubmits = works.map((work) =>
            {
                const submit = submits.find((s) => s._id.toString() === work._id.toString());
                return {
                    ...work.toObject(),
                    count: submit ? submit.count : 0,
                };
            });

            return worksWithSubmits;
        } else {
            const works = await Work.find({
                workers: { $nin: [user._id?.toString() || user.toString()] },
            }).sort({ status: 1, createdAt: -1 });

            return works;
        }

    } catch (error) {
        throw new Error('Error fetching works: ' + error.message);
    }
};
/**
 * List submissions for a status.
 *
 * Called without `page` it returns a plain array, which is what the user-facing
 * work history expects. Called with `page` it returns a paginated envelope,
 * including the total pending payout so the admin table can show it without
 * pulling every row.
 */
const getAllWorkSubmits = async (status, options = {}) =>
{
    try {
        const filter = { status };
        const query = WorkSubmit.find(filter)
            .sort({ createdAt: -1 })
            .populate('workId')
            .populate('userId', 'name username');

        if (!options.page) {
            return await query;
        }

        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 50;
        const skip = (page - 1) * limit;

        const [data, total, sum] = await Promise.all([
            query.skip(skip).limit(limit),
            WorkSubmit.countDocuments(filter),
            WorkSubmit.aggregate([
                { $match: filter },
                // Derive the collection name from the model: the SocialWork model
                // maps to `socialworks`, not `works` (that is the other Work model).
                { $lookup: { from: Work.collection.name, localField: 'workId', foreignField: '_id', as: 'work' } },
                { $unwind: { path: '$work', preserveNullAndEmptyArrays: true } },
                { $group: { _id: null, amount: { $sum: { $ifNull: ['$work.price', 0] } } } },
            ]),
        ]);

        return {
            data,
            total,
            totalAmount: sum[0]?.amount || 0,
            page,
            pages: Math.ceil(total / limit),
        };
    } catch (error) {
        throw new Error('Error fetching work submits: ' + error.message);
    }
}
const getWorkSubmitById = async (workSubmitId, status) => {
    try {
        const query = { userId: workSubmitId };
        if (status && status !== 'all') {
            query.status = status;
        }
        const workSubmit = await WorkSubmit.find(query)
            .populate('workId')
            .sort({ createdAt: -1 });

        return workSubmit;
    }
    catch (error) {
        throw new Error('Error fetching work submit: ' + error.message);
    }
}
const updateWork = async (workId, workData) =>
{
    try {
        const work = await Work.findByIdAndUpdate(workId, workData, { new: true });
        if (!work) {
            throw new Error('Work not found');
        }
        return work;
    }
    catch (error) {
        throw new Error('Error updating work: ' + error.message);
    }
}
const updateWorkSubmit = async (workSubmitId, workSubmitData) =>
{
    try {
        const workSubmit = await WorkSubmit.findByIdAndUpdate(workSubmitId, workSubmitData, { new: true });
        if (!workSubmit) {
            throw new Error('Work submit not found');
        }
        return workSubmit;
    }
    catch (error) {
        throw new Error('Error updating work submit: ' + error.message);
    }
}
const deleteWork = async (workId) =>
{
    try {
        const isAnySubmitExist = await WorkSubmit.find({ workId: workId, status: "pending" });
        if (isAnySubmitExist.length > 0) {
            throw new Error(`Work has ${isAnySubmitExist.length} pending submits cannot be deleted`);
        }
        const work = await Work.findByIdAndDelete(workId);
        if (!work) {
            throw new Error('Work not found');
        }
        return work;
    }
    catch (error) {
        throw new Error('Error deleting work: ' + error.message);
    }
}
const deleteWorkSubmit = async (workSubmitId) =>
{
    try {
        const workSubmit = await WorkSubmit.findByIdAndDelete(workSubmitId);
        if (!workSubmit) {
            throw new Error('Work submit not found');
        }
        return workSubmit;
    }
    catch (error) {
        throw new Error('Error deleting work submit: ' + error.message);
    }
}

module.exports = {
    createWork,
    createWorkSubmit,
    getWorkById,
    getAllWorks,
    getAllWorkSubmits,
    getWorkSubmitById,
    updateWork,
    updateWorkSubmit,
    deleteWork,
    deleteWorkSubmit,
    completeWorkSubmit
}
