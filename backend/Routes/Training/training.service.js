const TrainingCourse = require("./course.model");
const Trainer = require("./trainer.model");
const QuickAction = require("./quickAction.model");

const byOrder = (a, b) => (a.order || 0) - (b.order || 0);

/** Combined payload consumed by the user-facing /user/training page. */
const getTrainingPayload = async () => {
    const [courses, trainers, quickActions] = await Promise.all([
        TrainingCourse.find({ status: "active" }).sort({ order: 1, createdAt: -1 }),
        Trainer.find({ status: "active" }).sort({ order: 1, createdAt: -1 }),
        QuickAction.find({ status: "active" }).sort({ order: 1, createdAt: -1 }),
    ]);
    return {
        courses: courses.sort(byOrder),
        trainers: trainers.sort(byOrder),
        quickActions: quickActions.sort(byOrder),
    };
};

// ── Courses ──────────────────────────────────────────────────────────────
const getAllCourses = async () => {
    const courses = await TrainingCourse.find().sort({ order: 1, createdAt: -1 });
    return courses.sort(byOrder);
};

const createCourse = async (data) => {
    const course = await TrainingCourse.create(data);
    return course;
};

const updateCourse = async (id, data) => {
    const course = await TrainingCourse.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!course) {
        throw new Error("Course not found");
    }
    return course;
};

const deleteCourse = async (id) => {
    const course = await TrainingCourse.findByIdAndDelete(id);
    if (!course) {
        throw new Error("Course not found");
    }
    return course;
};

// ── Trainers ─────────────────────────────────────────────────────────────
const getAllTrainers = async () => {
    const trainers = await Trainer.find().sort({ order: 1, createdAt: -1 });
    return trainers.sort(byOrder);
};

const createTrainer = async (data) => {
    const trainer = await Trainer.create(data);
    return trainer;
};

const updateTrainer = async (id, data) => {
    const trainer = await Trainer.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!trainer) {
        throw new Error("Trainer not found");
    }
    return trainer;
};

const deleteTrainer = async (id) => {
    const trainer = await Trainer.findByIdAndDelete(id);
    if (!trainer) {
        throw new Error("Trainer not found");
    }
    return trainer;
};

// ── Quick Actions ────────────────────────────────────────────────────────
const getAllQuickActions = async () => {
    const quickActions = await QuickAction.find().sort({ order: 1, createdAt: -1 });
    return quickActions.sort(byOrder);
};

const createQuickAction = async (data) => {
    const action = await QuickAction.create(data);
    return action;
};

const updateQuickAction = async (id, data) => {
    const action = await QuickAction.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
    if (!action) {
        throw new Error("Quick action not found");
    }
    return action;
};

const deleteQuickAction = async (id) => {
    const action = await QuickAction.findByIdAndDelete(id);
    if (!action) {
        throw new Error("Quick action not found");
    }
    return action;
};

module.exports = {
    getTrainingPayload,
    getAllCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    getAllTrainers,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    getAllQuickActions,
    createQuickAction,
    updateQuickAction,
    deleteQuickAction,
};
