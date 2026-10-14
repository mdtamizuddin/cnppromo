// Escape user input before building a RegExp from it. Without this, input like
// "(a+)+$" can stall MongoDB (ReDoS) and ".*" matches every document.
const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = escapeRegex;
