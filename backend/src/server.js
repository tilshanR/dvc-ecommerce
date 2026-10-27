
import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`DVC Store server running on port ${PORT}`);
});
