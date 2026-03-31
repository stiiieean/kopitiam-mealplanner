const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET /register
exports.getRegister = (req, res) => {
  res.render('register', { failure: null });
};

// POST /register
exports.postRegister = async (req, res) => {
  const userid = req.body.userid;
  const username = req.body.username;
  const password = req.body.password;
  const agree = req.body.agree;

  if (!userid || !username || !password || !agree) {
    return res.render('register', { failure: 'All fields are required and you must agree to the terms.' });
  }

  if (password.length < 6) {
    return res.render('register', { failure: 'Password must be at least 6 characters.' });
  }

  try {
    const duplicate = await User.findUser(userid);
    if (duplicate) {
      return res.render('register', { failure: 'UserID already exists.' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    await User.addUser({ userid, username, password: hashPassword });

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.send('Error registering user');
  }
};

// GET /login
exports.getLogin = (req, res) => {
  if (req.session.user) {
    return res.redirect('/home');
  }
  res.render('login', { failure: null });
};

// POST /login
exports.postLogin = async (req, res) => {
  const userid = req.body.userid;
  const password = req.body.password;

  try {
    const user = await User.findUser(userid);

    if (!user) {
      return res.render('login', { failure: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.user = {
        _id: user._id,
        userid: user.userid,
        username: user.username
      };
      res.redirect('/home');
    } else {
      res.render('login', { failure: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.send('Error logging in');
  }
};

// GET /logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
