import mongoose from "mongoose";

const connectDB = async () => {
  const dbEnvironment = process.env.DB_ENV || "development";

  const uri =
    dbEnvironment === "test"
      ? process.env.MONGODB_TEST_URI
      : process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      `MongoDB URI is missing for ${dbEnvironment} environment.`,
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);

    console.log(
      `MongoDB connected successfully (${dbEnvironment} database).`,
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
