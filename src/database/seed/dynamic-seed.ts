// Load dotenv before any other import
export {};
const dotenv = await import("dotenv");
dotenv.config();

// Dynamically import main seeding logic after dotenv is loaded
const { default: main } = await import("./main.js");

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
