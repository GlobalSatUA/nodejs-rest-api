const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require('../models/contacts');


const listContactsController = async (req, res, next) => {
  try {
    const contacts = await listContacts(); 
    res.status(200).json(contacts); 
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
};

const getContactByIdController = async (req, res, next) => {
  const contactId = req.params.contactId;
  
  try {
    const contact = await getContactById(contactId);
    if (contact === null) {
      res.status(404).json({ message: 'Not found' });
    } else if (contact) {
      res.status(200).json(contact);
    }
  } catch (error) {
    next(error);
  }
};


const addContactController = async (req, res, next) => {
  const { name, email, phone } = req.body; 

  const contactData = { name, email, phone };

  try {
    const newContact = await addContact(contactData);
    res.status(201).json(newContact); 
  } catch (error) {
    console.error(error);
  }
};


const removeContactController = async (req, res, next) => {
  const contactId = req.params.contactId;

  try {
    const contactRemoved = await removeContact(contactId); 
    if (contactRemoved) {
      res.status(200).json({ message: 'Contact deleted' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.error(error);
  }
};



const updateContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const updatedData = req.body;
  
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: 'missing fields' });
    }
  
    try {
      const updatedContact = await updateContact(contactId, updatedData);
      if (!updatedContact) {
        return res.status(404).json({ message: 'Not found' });
      }
  
      res.status(200).json(updatedContact);
    } catch (error) {
      if (error.message === 'Contact not found') {
        return res.status(404).json({ message: 'Not found' });
      }
  
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  const updateStatusContactController = async (req, res, next) => {
    const { contactId } = req.params;
    const { favorite } = req.body;
  
    if (favorite === undefined) {
      return res.status(400).json({ message: 'missing field favorite' });
    }
  
    if (typeof favorite !== 'boolean') {
      return res.status(400).json({ message: 'favorite must be a boolean' });
    }
  
    try {
      const updatedContact = await updateStatusContact(contactId, { favorite });
      if (updatedContact) {
        return res.status(200).json(updatedContact);
      } else {
        return res.status(404).json({ message: 'Not found' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  

module.exports = {
    listContactsController,
    getContactByIdController,
    addContactController,
    updateContactController,
    removeContactController,
    updateStatusContactController,
};

