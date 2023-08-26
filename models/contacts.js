const Contact = require('./mongoSchema'); 

const listContacts = async () => {
  try {
    return await Contact.find();
  } catch (error) {
    throw error;
  }
};

const getContactById = async (contactId) => {
  try {
    return await Contact.findById(contactId);
  } catch (error) {
    throw error;
  }
};

const addContact = async (body) => {
  try {
    return await Contact.create(body);
  } catch (error) {
    throw error;
  }
};

const removeContact = async (contactId) => {
  try {
    const result = await Contact.findByIdAndRemove(contactId);
    if (result) {
      console.log(`Contact with ID ${contactId} has been deleted`);
      return true;
    } else {
      console.log(`Contact with ID ${contactId} not found`);
      return false;
    }
  } catch (error) {
    throw error;
  }
};

const updateContact = async (contactId, updatedData) => {
  try {
    const result = await Contact.findByIdAndUpdate(contactId, updatedData, { new: true });
    if (result) {
      return result;
    } else {
      throw new Error('Contact not found');
    }
  } catch (error) {
    throw error;
  }
};

const updateStatusContact = async (contactId, updatedData) => {
  try {
    const result = await Contact.findByIdAndUpdate(contactId, updatedData, { new: true });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};
