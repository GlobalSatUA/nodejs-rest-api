const User = require('../models/user');

async function checkUserVerification(req, res, next) {
  try {
    const userEmail = req.body.email;

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: 'Not found' });
    }

    if (user.verify === true) {
      next();
    } else {
      return res.status(403).json({ message: 'User not verify' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal error' });
  }
}

module.exports = { checkUserVerification };
