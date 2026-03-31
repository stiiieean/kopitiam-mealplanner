const User = require('../models/User');
const bcrypt = require('bcrypt');

const emptyForm = { userid: '', username: '', role: 'user' };

// GET /admin
exports.getDashboard = async (req, res) => {
  try {
    const users = await User.findAll('userid username role');
    res.render('admin', { users, success: null, failure: null, createFailure: null, formData: emptyForm });
  } catch (error) {
    console.error(error);
    res.send('Error loading admin dashboard');
  }
};

// POST /admin/users/create
exports.createUser = async (req, res) => {
  const { userid, username, password, role } = req.body;
  const formData = { userid, username, role };

  // Validate fields
  if (!userid || !username || !password || !role) {
    const users = await User.findAll('userid username role');
    return res.render('admin', { users, success: null, failure: null, createFailure: 'All fields are required.', formData });
  }

  if (password.length < 6) {
    const users = await User.findAll('userid username role');
    return res.render('admin', { users, success: null, failure: null, createFailure: 'Password must be at least 6 characters.', formData });
  }

  if (!['user', 'admin'].includes(role)) {
    const users = await User.findAll('userid username role');
    return res.render('admin', { users, success: null, failure: null, createFailure: 'Invalid role selected.', formData });
  }

  try {
    const duplicate = await User.findUser(userid);
    if (duplicate) {
      const users = await User.findAll('userid username role');
      return res.render('admin', { users, success: null, failure: null, createFailure: 'User ID already exists.', formData });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await User.addUser({ userid, username, password: hashPassword, role });

    const users = await User.findAll('userid username role');
    res.render('admin', { users, success: `Account "${userid}" created successfully.`, failure: null, createFailure: null, formData: emptyForm });
  } catch (error) {
    console.error(error);
    res.send('Error creating user');
  }
};

// POST /admin/users/:userId/delete
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const target = await User.findById(userId);

    if (!target) {
      const users = await User.findAll('userid username role');
      return res.render('admin', { users, success: null, failure: 'User not found.', createFailure: null, formData: emptyForm });
    }

    if (target.role === 'admin') {
      const users = await User.findAll('userid username role');
      return res.render('admin', { users, success: null, failure: 'Admin accounts cannot be deleted.', createFailure: null, formData: emptyForm });
    }

    await User.deleteById(userId);
    const users = await User.findAll('userid username role');
    res.render('admin', { users, success: 'User deleted successfully.', failure: null, createFailure: null, formData: emptyForm });
  } catch (error) {
    console.error(error);
    res.send('Error deleting user');
  }
};

// POST /admin/users/:userId/role
exports.updateRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    const users = await User.findAll('userid username role');
    return res.render('admin', { users, success: null, failure: 'Invalid role.', createFailure: null, formData: emptyForm });
  }

  if (userId === req.session.user._id.toString() && role !== 'admin') {
    const users = await User.findAll('userid username role');
    return res.render('admin', { users, success: null, failure: 'You cannot change your own role.', createFailure: null, formData: emptyForm });
  }

  try {
    await User.findByIdAndUpdate(userId, { role });
    const users = await User.findAll('userid username role');
    res.render('admin', { users, success: 'Role updated successfully.', failure: null, createFailure: null, formData: emptyForm });
  } catch (error) {
    console.error(error);
    res.send('Error updating role');
  }
};
