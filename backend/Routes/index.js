const authChecker = require("../util/authChecker");

const router = require("express").Router();


// user Router
router.use('/user', require('./User/user.controller'))
router.use('/work', authChecker, require('./Works/work.controller'))
router.use('/withdraw', authChecker, require('./WithDraw/withdraw.controller'))
router.use('/topup', authChecker, require('./TopUp/topup.controller'))
router.use('/refer', authChecker, require('./Refer/refer.controller'))
router.use('/message', require('./message/message.controller'))
router.use('/upload', require('./uploadFile'))
router.use('/external-withdraw', authChecker, require('./external-withdraw/external.controllar'))
router.use("/social-works", authChecker, require("./social-works/work.controller"));
router.use("/dashboard", authChecker, require("./Dashboard/dashboard.controller"));
router.use("/session", require("./Session/session.controller"));
router.use('/notification', authChecker, require('./Notification/notification.controller'))
router.use('/review', require('./Review/review.controller'))

module.exports = router