// Ensure NODE_ENV is set before anything else

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Support running from any directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
