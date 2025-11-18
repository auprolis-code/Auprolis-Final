const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.delete('/:id', authorize('admin'), deleteUser);

// Protected routes
router.get('/:id', getUser);
router.put('/:id', updateUser);

module.exports = router;









