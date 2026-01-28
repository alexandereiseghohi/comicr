import { seed } from "./seed";

(async () => {
  try {
    const result = await seed();
    console.log(JSON.stringify(result, null, 2));
    if (!result.success) process.exit(1);
    process.exit(0);
  } catch (error) {
    console.error("Seed runner error:", error);
    process.exit(1);
  }
})();
