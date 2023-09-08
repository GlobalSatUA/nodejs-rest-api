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
const  validateObjectId  = require('../../middleware/validateObjectId');
const {checkToken} = require('../../middleware/checkToken');

router.get('/',checkToken, listContactsController);
router.get('/:contactId',checkToken, getContactByIdController);
router.post('/',checkToken, validateData, addContactController);
router.put('/:contactId',checkToken, validateObjectId, validateData, updateContactController);
router.delete('/:contactId',checkToken, validateObjectId, removeContactController);
router.patch('/:contactId/favorite',checkToken, validateObjectId, updateStatusContactController);




module.exports = router;

