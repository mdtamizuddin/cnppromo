const { Work, WorkSubmit } = require('./work.model');
const ProfitLedger = require('./profitLedger.model');
const User = require('../User/user.model');
const Setting = require('../Settings/setting.model');
const { notifyUser, notifyMany } = require('../Notification/notification.service');

/**
 * Get active platform commission percentage from Setting
 */
const getCommissionRate = async () => {
    try {
        const setting = await Setting.findOne();
        const percent = typeof setting?.taskCommissionPercentage === 'number' 
            ? setting.taskCommissionPercentage 
            : 10;
        return percent / 100;
    } catch {
        return 0.10; // Default 10%
    }
};

/**
 * Provider creates a task and funds it via Escrow
 */
const createWork = async (workData, userId) => {
    try {
        const targetQuantity = parseInt(workData.targetQuantity) || 1;
        const costPerUnit = parseFloat(workData.costPerUnit || workData.price) || 0;

        if (costPerUnit <= 0) {
            throw new Error("Cost per unit must be greater than 0");
        }
        if (targetQuantity <= 0) {
            throw new Error("Target quantity must be at least 1");
        }

        const totalBudget = Math.round(targetQuantity * costPerUnit * 100) / 100;

        // Atomically deduct escrow from provider's balance
        const provider = await User.findOneAndUpdate(
            { _id: userId, balance: { $gte: totalBudget } },
            { $inc: { balance: -totalBudget } },
            { new: true }
        );

        if (!provider) {
            throw new Error(`Insufficient balance. You need ৳${totalBudget.toFixed(2)} to fund this task.`);
        }

        const work = new Work({
            ...workData,
            providerId: userId,
            targetQuantity,
            costPerUnit,
            price: costPerUnit, // Backwards compat
            totalBudget,
            escrowRemaining: totalBudget,
            taskUrl: workData.taskUrl || workData.url || "",
            url: workData.taskUrl || workData.url || "",
            status: "PENDING_APPROVAL",
        });

        await work.save();

        // Notify Admins about pending task
        const admins = await User.find({ role: "admin" }).select("_id");
        if (admins.length > 0) {
            notifyMany(admins.map((a) => a._id), {
                category: "tasks",
                type: "new_task_pending",
                title: "নতুন টাস্ক অনুমোদনের অপেক্ষায়",
                message: `${provider.name || provider.username} একটি নতুন টাস্ক তৈরি করেছেন (${work.title} - বাজেট ৳${totalBudget})।`,
                link: "/admin/social-works",
            });
        }

        return work;
    } catch (error) {
        throw new Error('Error creating task: ' + error.message);
    }
};

/**
 * Worker / Public available tasks list with hidden fee calculation
 */
const getAllWorks = async (user) => {
    try {
        const userRes = await User.findById(user._id || user);
        if (!userRes) throw new Error('User not found');

        const commissionRate = await getCommissionRate();

        if (userRes.role === 'admin') {
            const works = await Work.find()
                .populate('providerId', 'name username email')
                .sort({ createdAt: -1 });

            const pendingSubmits = await WorkSubmit.aggregate([
                { $match: { status: { $in: ["PENDING", "pending"] } } },
                { $group: { _id: '$workId', count: { $sum: 1 } } },
            ]);

            return works.map((w) => {
                const pending = pendingSubmits.find((s) => s._id.toString() === w._id.toString());
                return {
                    ...w.toObject(),
                    count: pending ? pending.count : 0,
                };
            });
        }

        // Active marketplace tasks for workers:
        // Must be ACTIVE, worker not in workers array, and not yet full
        const works = await Work.find({
            status: { $in: ["ACTIVE", "active"] },
            workers: { $nin: [userRes._id.toString()] },
            $expr: { $lt: ["$completedQuantity", "$targetQuantity"] }
        })
        .select("-workers")
        .sort({ createdAt: -1 });

        // Mask provider's gross cost and show only net reward to the worker
        return works.map((task) => {
            const gross = task.costPerUnit || task.price || 0;
            const netReward = Math.round(gross * (1 - commissionRate) * 100) / 100;
            const obj = task.toObject();
            delete obj.costPerUnit;
            delete obj.totalBudget;
            delete obj.escrowRemaining;
            return {
                ...obj,
                reward: netReward,
                price: netReward, // Backwards compat for UI
            };
        });
    } catch (error) {
        throw new Error('Error fetching tasks: ' + error.message);
    }
};

/**
 * Fetch tasks created by authenticated user (Provider)
 */
const getMyCreatedTasks = async (userId) => {
    try {
        const works = await Work.find({ providerId: userId }).sort({ createdAt: -1 });
        const pendingSubmits = await WorkSubmit.aggregate([
            { $match: { providerId: userId, status: { $in: ["PENDING", "pending"] } } },
            { $group: { _id: '$workId', count: { $sum: 1 } } }
        ]);

        return works.map((w) => {
            const pending = pendingSubmits.find((s) => s._id.toString() === w._id.toString());
            return {
                ...w.toObject(),
                pendingSubmissions: pending ? pending.count : 0,
            };
        });
    } catch (error) {
        throw new Error('Error fetching my tasks: ' + error.message);
    }
};

/**
 * Get single task details
 */
const getWorkById = async (workId, user) => {
    try {
        const work = await Work.findById(workId).populate('providerId', 'name username');
        if (!work) throw new Error('Task not found');

        const commissionRate = await getCommissionRate();
        const gross = work.costPerUnit || work.price || 0;
        const netReward = Math.round(gross * (1 - commissionRate) * 100) / 100;

        const isOwnerOrAdmin = user && (
            user.role === 'admin' || 
            work.providerId?._id?.toString() === user._id?.toString()
        );

        const obj = work.toObject();
        obj.reward = netReward;

        if (!isOwnerOrAdmin) {
            delete obj.costPerUnit;
            delete obj.totalBudget;
            delete obj.escrowRemaining;
            obj.price = netReward;
        }

        return obj;
    } catch (error) {
        throw new Error('Error fetching task: ' + error.message);
    }
};

/**
 * Worker submits completed task proof
 */
const createWorkSubmit = async (data, workerId) => {
    try {
        const task = await Work.findById(data.workId);
        if (!task) throw new Error('Task not found');

        if (!["ACTIVE", "active"].includes(task.status)) {
            throw new Error('This task is not currently active');
        }

        if (task.completedQuantity >= task.targetQuantity) {
            throw new Error('This task has already reached its target capacity');
        }

        if (task.workers && task.workers.some((w) => w.toString() === workerId.toString())) {
            throw new Error('You have already submitted proof for this task');
        }

        const commissionRate = await getCommissionRate();
        const gross = task.costPerUnit || task.price || 0;
        const platformFee = Math.round(gross * commissionRate * 100) / 100;
        const netAmount = Math.round((gross - platformFee) * 100) / 100;

        const proofData = data.proofData || {
            text: data.answers?.join(", ") || data.text || "",
            screenshots: data.screenshots || (data.proofImage ? [data.proofImage] : []),
            watchedSeconds: data.duration || 0,
        };

        const workSubmit = new WorkSubmit({
            workId: task._id,
            providerId: task.providerId,
            userId: workerId,
            proofData,
            answers: data.answers || [],
            duration: data.duration || 0,
            grossAmount: gross,
            netAmount,
            platformFee,
            status: "PENDING",
        });

        await workSubmit.save();

        // Mark worker as submitted
        await Work.findByIdAndUpdate(task._id, {
            $push: { workers: workerId }
        });

        // Notify provider
        if (task.providerId) {
            notifyUser(task.providerId, {
                category: "tasks",
                type: "task_submitted",
                title: "নতুন সাবমিশন জমা পড়েছে",
                message: `"${task.title}" কাজের জন্য একজন কর্মী প্রুফ জমা দিয়েছেন। যাচাই করে অনুমোদন দিন।`,
                link: "/user/social-works",
            });
        }

        return workSubmit;
    } catch (error) {
        throw new Error('Error submitting work: ' + error.message);
    }
};

/**
 * Provider reviews worker submission (APPROVE or REJECT)
 */
const providerReviewSubmission = async (submitId, user, { status, rejectionReason }) => {
    try {
        const submit = await WorkSubmit.findById(submitId).populate('workId');
        if (!submit) throw new Error('Submission not found');

        const isOwner = submit.providerId && submit.providerId.toString() === user._id.toString();
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
            throw new Error('Unauthorized to review this submission');
        }

        if (status === "APPROVED" || status === "completed") {
            // Atomic flip from PENDING to APPROVED
            const updatedSubmit = await WorkSubmit.findOneAndUpdate(
                { _id: submitId, status: { $in: ["PENDING", "pending"] } },
                { status: "APPROVED", reviewedAt: new Date() },
                { new: true }
            ).populate('workId');

            if (!updatedSubmit) {
                throw new Error('This submission has already been reviewed');
            }

            // 1. Credit Worker Balance with Net Amount
            if (updatedSubmit.netAmount > 0) {
                await User.findByIdAndUpdate(updatedSubmit.userId, {
                    $inc: { balance: updatedSubmit.netAmount }
                });
            }

            // 2. Deduct from Task Escrow and increment completed count
            const task = await Work.findByIdAndUpdate(updatedSubmit.workId._id, {
                $inc: { 
                    escrowRemaining: -updatedSubmit.grossAmount,
                    completedQuantity: 1 
                }
            }, { new: true });

            if (task && task.completedQuantity >= task.targetQuantity) {
                task.status = "COMPLETED";
                await task.save();
            }

            // 3. Record in Platform Profit Ledger
            await ProfitLedger.create({
                taskId: updatedSubmit.workId._id,
                submissionId: updatedSubmit._id,
                providerId: updatedSubmit.providerId,
                workerId: updatedSubmit.userId,
                grossAmount: updatedSubmit.grossAmount,
                netAmount: updatedSubmit.netAmount,
                platformFee: updatedSubmit.platformFee,
            });

            // 4. Notify Worker
            notifyUser(updatedSubmit.userId, {
                category: "tasks",
                type: "task_approved",
                title: "কাজ অনুমোদিত হয়েছে! 🎉",
                message: `"${updatedSubmit.workId?.title}" কাজের অনুমোদন পেয়েছেন এবং ৳${updatedSubmit.netAmount.toFixed(2)} ব্যালেন্সে যোগ হয়েছে।`,
                link: "/user/social-works",
            });

            return updatedSubmit;
        } else if (status === "REJECTED" || status === "rejected") {
            const reason = rejectionReason || "Submission did not satisfy task requirements.";
            const updatedSubmit = await WorkSubmit.findOneAndUpdate(
                { _id: submitId, status: { $in: ["PENDING", "pending"] } },
                { status: "REJECTED", rejectionReason: reason, reviewedAt: new Date() },
                { new: true }
            ).populate('workId');

            if (!updatedSubmit) {
                throw new Error('This submission has already been reviewed');
            }

            // Re-open worker slot by removing worker from task.workers
            await Work.findByIdAndUpdate(updatedSubmit.workId._id, {
                $pull: { workers: updatedSubmit.userId }
            });

            // Notify Worker
            notifyUser(updatedSubmit.userId, {
                category: "tasks",
                type: "task_rejected",
                title: "কাজ বাতিল করা হয়েছে",
                message: `"${updatedSubmit.workId?.title}" কাজের সাবমিশন বাতিল করা হয়েছে। কারণ: ${reason}`,
                link: "/user/social-works",
            });

            return updatedSubmit;
        } else {
            throw new Error('Invalid review status action');
        }
    } catch (error) {
        throw new Error('Error reviewing submission: ' + error.message);
    }
};

/**
 * Admin Moderates Task (APPROVE or REJECT with Instant Refund)
 */
const adminModerateTask = async (taskId, { action, rejectionReason }) => {
    try {
        const task = await Work.findById(taskId);
        if (!task) throw new Error('Task not found');

        if (action === "APPROVE") {
            task.status = "ACTIVE";
            task.rejectionReason = null;
            await task.save();

            // Notify Provider
            if (task.providerId) {
                notifyUser(task.providerId, {
                    category: "tasks",
                    type: "task_active",
                    title: "টাস্ক সক্রিয় করা হয়েছে! 🚀",
                    message: `আপনার টাস্ক "${task.title}" অ্যাডমিন কর্তৃক অনুমোদিত হয়েছে এবং এখন কর্মীরা দেখতে পাচ্ছেন।`,
                    link: "/user/social-works",
                });
            }

            // Broadcast to active workers
            const activeUsers = await User.find({ status: "active" }).select("_id");
            notifyMany(activeUsers.map((u) => u._id), {
                category: "tasks",
                type: "new_task",
                title: "নতুন টাস্ক যোগ হয়েছে",
                message: `নতুন টাস্ক: "${task.title}"। এখনই সম্পন্ন করে আয় করুন!`,
                link: "/user/social-works",
            });

            return task;
        } else if (action === "REJECT") {
            const reason = rejectionReason || "Violated platform community guidelines.";

            const updatedTask = await Work.findOneAndUpdate(
                { _id: taskId, status: { $ne: "REJECTED" } },
                { status: "REJECTED", rejectionReason: reason },
                { new: true }
            );

            if (!updatedTask) throw new Error('Task already rejected');

            // 🌟 Instant Escrow Refund to Provider's Balance
            if (updatedTask.providerId && updatedTask.escrowRemaining > 0) {
                await User.findByIdAndUpdate(updatedTask.providerId, {
                    $inc: { balance: updatedTask.escrowRemaining }
                });

                notifyUser(updatedTask.providerId, {
                    category: "tasks",
                    type: "task_rejected_refunded",
                    title: "টাস্ক বাতিল ও রিফান্ড 💸",
                    message: `আপনার টাস্ক "${updatedTask.title}" বাতিল করা হয়েছে (${reason}) এবং অবশিষ্ট ৳${updatedTask.escrowRemaining.toFixed(2)} ব্যালেন্সে রিফান্ড করা হয়েছে।`,
                    link: "/user/social-works",
                });
            }

            return updatedTask;
        } else {
            throw new Error("Invalid moderation action");
        }
    } catch (error) {
        throw new Error('Error moderating task: ' + error.message);
    }
};

/**
 * Get Submissions for a specific task (Provider or Admin)
 */
const getTaskSubmissions = async (taskId, user) => {
    try {
        const task = await Work.findById(taskId);
        if (!task) throw new Error('Task not found');

        const isOwner = task.providerId && task.providerId.toString() === user._id.toString();
        const isAdmin = user.role === 'admin';

        if (!isOwner && !isAdmin) {
            throw new Error('Unauthorized to view submissions for this task');
        }

        const submits = await WorkSubmit.find({ workId: taskId })
            .populate('userId', 'name username email')
            .sort({ createdAt: -1 });

        return submits;
    } catch (error) {
        throw new Error('Error fetching submissions: ' + error.message);
    }
};

/**
 * Submissions history (Worker's own or Admin all submits)
 */
const getAllWorkSubmits = async (status, options = {}, user) => {
    try {
        const filter = {};
        if (status && status !== 'all') {
            if (["pending", "completed", "rejected"].includes(status)) {
                filter.status = { $in: [status, status.toUpperCase()] };
            } else {
                filter.status = status;
            }
        }

        const query = WorkSubmit.find(filter)
            .sort({ createdAt: -1 })
            .populate('workId')
            .populate('userId', 'name username email')
            .populate('providerId', 'name username email');

        if (!options.page) {
            return await query;
        }

        const page = parseInt(options.page) || 1;
        const limit = parseInt(options.limit) || 50;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            query.skip(skip).limit(limit),
            WorkSubmit.countDocuments(filter),
        ]);

        return {
            data,
            total,
            page,
            pages: Math.ceil(total / limit),
        };
    } catch (error) {
        throw new Error('Error fetching submits: ' + error.message);
    }
};

/**
 * User-specific submission history (Worker view)
 */
const getWorkSubmitById = async (userId, status) => {
    try {
        const query = { userId };
        if (status && status !== 'all') {
            query.status = { $in: [status, status.toUpperCase()] };
        }
        const submits = await WorkSubmit.find(query)
            .populate('workId')
            .sort({ createdAt: -1 });

        return submits;
    } catch (error) {
        throw new Error('Error fetching user submits: ' + error.message);
    }
};

/**
 * Admin Analytics for Marketplace & Commissions
 */
const getAdminAnalytics = async () => {
    try {
        const [profitAgg, volumeAgg, escrowAgg, pendingCount, completedCount] = await Promise.all([
            ProfitLedger.aggregate([
                { $group: { _id: null, totalProfit: { $sum: '$platformFee' } } }
            ]),
            ProfitLedger.aggregate([
                { $group: { _id: null, totalVolume: { $sum: '$grossAmount' } } }
            ]),
            Work.aggregate([
                { $match: { status: { $in: ["ACTIVE", "active", "PENDING_APPROVAL"] } } },
                { $group: { _id: null, totalEscrow: { $sum: '$escrowRemaining' } } }
            ]),
            Work.countDocuments({ status: "PENDING_APPROVAL" }),
            WorkSubmit.countDocuments({ status: { $in: ["APPROVED", "completed"] } }),
        ]);

        return {
            totalPlatformProfit: profitAgg[0]?.totalProfit || 0,
            totalMarketplaceVolume: volumeAgg[0]?.totalVolume || 0,
            activeEscrowHeld: escrowAgg[0]?.totalEscrow || 0,
            pendingModerationCount: pendingCount || 0,
            completedSubmissionsCount: completedCount || 0,
        };
    } catch (error) {
        throw new Error('Error fetching analytics: ' + error.message);
    }
};

/**
 * Delete a Task (Admin only, safety check)
 */
const deleteWork = async (workId) => {
    try {
        const pendingSubmits = await WorkSubmit.countDocuments({ 
            workId, 
            status: { $in: ["PENDING", "pending"] } 
        });
        if (pendingSubmits > 0) {
            throw new Error(`Cannot delete task: it has ${pendingSubmits} pending submissions awaiting review.`);
        }

        const task = await Work.findById(workId);
        if (!task) throw new Error('Task not found');

        // Refund remaining escrow to provider if task wasn't already completed/refunded
        if (task.providerId && task.escrowRemaining > 0 && !["REJECTED", "COMPLETED"].includes(task.status)) {
            await User.findByIdAndUpdate(task.providerId, {
                $inc: { balance: task.escrowRemaining }
            });
        }

        await Work.findByIdAndDelete(workId);
        return { message: "Task deleted and remaining escrow returned if applicable." };
    } catch (error) {
        throw new Error('Error deleting task: ' + error.message);
    }
};

module.exports = {
    createWork,
    getAllWorks,
    getMyCreatedTasks,
    getWorkById,
    createWorkSubmit,
    providerReviewSubmission,
    adminModerateTask,
    getTaskSubmissions,
    getAllWorkSubmits,
    getWorkSubmitById,
    getAdminAnalytics,
    deleteWork,
};
