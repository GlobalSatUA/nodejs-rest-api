const express = require('express');
const router = express.Router();
const { 
  listContactsController,
  getContactByIdController,
  addContactController,
  updateContactController,
  removeContactController,
  updateStatusContactController,
} = require('../../controllers/contactController');
const { validateData } = require('../../schema/contactsSchema');
const  validateObjectId  = require('../../schema/validateObjectId');

router.get('/', listContactsController);
router.get('/:contactId', getContactByIdController);
router.post('/', validateData, addContactController);
router.put('/:contactId', validateObjectId, validateData, updateContactController);
router.delete('/:contactId', validateObjectId, removeContactController);
router.patch('/:contactId/favorite', validateObjectId, updateStatusContactController)


module.exports = router;

