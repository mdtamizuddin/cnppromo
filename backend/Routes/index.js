const authChecker = require("../util/authChecker");
const activeChecker = require("../util/activeChecker");

const router = require("express").Router();

// user Router
router.use('/user', require('./User/user.controller'))
router.use('/work', authChecker, activeChecker, require('./Works/work.controller'))
router.use('/withdraw', authChecker, activeChecker, require('./WithDraw/withdraw.controller'))
router.use('/topup', authChecker, activeChecker, require('./TopUp/topup.controller'))
router.use('/refer', authChecker, activeChecker, require('./Refer/refer.controller'))
router.use('/message', authChecker, activeChecker, require('./message/message.controller'))
router.use('/upload', authChecker, activeChecker, require('./uploadFile'))
router.use('/external-withdraw', authChecker, activeChecker, require('./external-withdraw/external.controllar'))
router.use("/tasks", authChecker, activeChecker, require("./Marketplace/task.controller"));
router.use("/training", authChecker, activeChecker, require("./Training/training.controller"));
router.use("/dashboard", authChecker, activeChecker, require("./Dashboard/dashboard.controller"));
router.use("/session", require("./Session/session.controller"));
router.use('/notification', authChecker, activeChecker, require('./Notification/notification.controller'))
router.use('/review', require('./Review/review.controller'))
router.use('/payment-proof', require('./PaymentProof/proof.controller'))
router.use('/gateway', require('./Gateway/gateway.controller'))

module.exports = router