const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { handleChat } = require('../controllers/chatController');

// POST /api/chat — accepts text + optional image
router.post('/', upload.single('image'), handleChat);

module.exports = router;
