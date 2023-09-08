const mongoose = require('mongoose');

const validateObjectId = (req, res, next) => {
  const contactId = req.params.contactId;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(404).json({ message: 'Not found' });
  }

  next();
};

module.exports = validateObjectId;
