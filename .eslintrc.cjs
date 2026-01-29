module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  rules: {
    // Relax explicit any to a warning across the project (tests use many mocks)
    "@typescript-eslint/no-explicit-any": "warn",
    // Allow ts-ignore in small places but keep as a warning
    "@typescript-eslint/ban-ts-comment": "warn",
  },
  overrides: [
    {
      files: ["tests/**/*.ts", "tests/**/*.tsx", "tests/**/*.spec.*", "tests/**/*.smoke.*"],
      rules: {
        // Tests may use `any` in mock fixtures; allow it for test files.
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
