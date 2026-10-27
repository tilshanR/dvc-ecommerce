import ContactMessage from "./contactModel.js";//imports  Mongoose model, which defines how contact messages are stored in MongoDB.

// Creates a new contact message document in MongoDB.
// contactData contains the validated contact form data.
const createContactMessage = async (contactData) => {
  return await ContactMessage.create(contactData); //ContactMessage.create() saves a new document to MongoDB
};

// Groups all contact-related database operations together.
// Other layers can use this object without directly accessing the model.
const contactRepository = {
  createContactMessage,
};
// Makes the repository available to other files.
export default contactRepository;
