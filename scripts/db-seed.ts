#!/usr/bin/env node
/**
 * Simple idempotent seed script for local dev.
 * Usage: pnpm db:seed
 */
import { writeFileSync } from "fs";

// Minimal placeholder: put JSON files under scripts/seed-data or call your ORM seeding flow.
const marker = { seededAt: new Date().toISOString() };
writeFileSync("scripts/.seed-marker.json", JSON.stringify(marker, null, 2));
console.log(
  "Seed marker written — replace this script with real seeding logic for your ORM.",
);
