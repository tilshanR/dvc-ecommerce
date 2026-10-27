import contactRepository from "./contactRepository.js";
// Handles the business logic for creating a contact message.
const createContactMessage=async(contactData)=>{
      // Save the contact message using the repository
      const savedMessage=
        await contactRepository.createContactMessage(contactData);
      return savedMessage;

};

// Groups the contact-related business logic together.
const contactService={
    createContactMessage,
};
// Makes the service available to other files.
export default contactService;
// The service sits between the controller and repository.
// - Import: Gets access to the repository without directly accessing MongoDB.
// - Business logic: Calls the repository to save the contact message.
// - Return: Passes the saved document back to the controller.
// - Export: Makes the service available to other files.