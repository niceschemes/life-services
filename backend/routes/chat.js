const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/v1/chatController');

router.use(auth);
router.get('/history', ctrl.history);
router.post('/send', ctrl.send);

module.exports = router;
