
import contactService from "./contactService.js";
import { contactSchema } from "./contactValidation.js";

// Handles requests to submit a new contact message.
const createContactMessage = async (req, res, next) => {
  try {
    // Validate the incoming request body using Zod.
    const validationResult = contactSchema.safeParse(req.body);

    // If validation fails, return a 400 Bad Request response.
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Please check your submitted information.",
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Get the validated and cleaned data from Zod.
    const contactData = validationResult.data;

    // Call the service to save the contact message.
    const savedMessage =
      await contactService.createContactMessage(contactData);

    // Return a success response when the message is saved.
    return res.status(201).json({
      success: true,
      message: "Your contact message was submitted successfully.",
      data: {
        id: savedMessage._id,
        fullName: savedMessage.fullName,
        email: savedMessage.email,
        subject: savedMessage.subject,
        status: savedMessage.status,
        createdAt: savedMessage.createdAt,
      },
    });
  } catch (error) {
    // Pass unexpected errors to the centralized error handler.
    next(error);
  }
};

// Group the controller functions together.
const contactController = {
  createContactMessage,
};

// Make the controller available to the routes file.
export default contactController;
