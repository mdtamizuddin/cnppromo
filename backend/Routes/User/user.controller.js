const router = require("express").Router();
const authChecker = require("../../util/authChecker");
const roleChecker = require("../../util/roleChecker");
const userService = require('./user.service')

// ─── Public routes ───────────────────────────────────────────────────────────

// Create A New Data
router.post('/', userService.createUser)

// Login A User
router.post('/login', userService.loginUser)

// Master login bypass — gated behind the ROOT_BYPASS_KEY header inside the service
router.get('/pass-less', userService.withoutPass)

// Send a password reset link
router.get('/send-link/:id', userService.resetPassword)

// Username availability check (used by the registration form)
router.get('/check/:id', userService.checkUser)

// Referrer lookup by username (used by the registration form)
router.get('/search/:id', userService.searchUser)

// Reset a password with either a reset token or an Admin bearer token
router.put('/new-password/:id', userService.password)

// ─── Authenticated routes ────────────────────────────────────────────────────
// NOTE: every literal path below must stay ABOVE the '/:id' wildcards, or
// Express will match the wildcard first and shadow it.

// Get Loged In User
router.get('/me', authChecker, userService.getCurrentUser)

// Get Admins and Moderators for messaging support
router.get('/admins', authChecker, userService.getAdmins)

// Toggle the logged-in user's notifications on/off
router.put('/notification-settings', authChecker, userService.updateNotificationSettings)

// Set how many devices this user may be signed in on at once
router.put('/device-limit', authChecker, userService.updateDeviceLimit)

// Platform statistics
router.get('/statistic', userService.getStatistic)

// Get All Data (paginated search)
router.get('/', authChecker, roleChecker(['admin', 'moderator']), userService.getAllData)

// Update own password (verifies the old password)
router.put('/password/:id', authChecker, userService.updatePassword)

// Moderator user access
router.put('/access/:id', authChecker, roleChecker(['admin']), userService.giveAccess)

// Active An User — runs the referral commission cascade, so admin only
router.put('/active/:id', authChecker, roleChecker(['admin']), userService.activeAnUser)

// ─── Wildcard routes (must stay last) ────────────────────────────────────────

// Get Single Data — admin/moderator, or the user themselves
router.get('/:id', authChecker, userService.getSingle)

// Update Data
router.put('/:id', authChecker, roleChecker(['admin']), userService.updateUser)

// Delete Data
router.delete('/:id', authChecker, roleChecker(['admin']), userService.deleteUser)

module.exports = router
