#!/usr/bin/env tsx
/**
 * AST Refactoring Script
 * @description Uses ts-morph to perform automated code quality improvements
 * @usage pnpm tsx scripts/ast-refactor.ts
 */

import path from "node:path";

import { type ImportDeclarationStructure, type OptionalKind, Project, SyntaxKind } from "ts-morph";

const project = new Project({
  tsConfigFilePath: "./tsconfig.json",
});

interface RefactoringStats {
  anyTypesReplaced: number;
  filesProcessed: number;
  importsOrganized: number;
  unusedVarsRemoved: number;
}

const stats: RefactoringStats = {
  filesProcessed: 0,
  anyTypesReplaced: 0,
  importsOrganized: 0,
  unusedVarsRemoved: 0,
};

/**
 * Replace 'any' types with 'unknown' where appropriate
 */
function replaceAnyTypes(fileP: string) {
  const sourceFile = project.getSourceFile(fileP);
  if (!sourceFile) return;

  let replacements = 0;

  // Find all 'any' type annotations
  for (const anyNode of sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword)) {
    // Skip if it's in a comment or disabled explicitly
    const parent = anyNode.getParent();
    const text = parent?.getText() || "";

    // Only replace if not in eslint-disable comment
    if (!text.includes("eslint-disable-next-line") && !text.includes("@typescript-eslint/no-explicit-any")) {
      try {
        // Replace 'any' with 'unknown' for safer typing
        anyNode.replaceWithText("unknown");
        replacements++;
      } catch {
        // Skip if replacement fails
      }
    }
  }

  if (replacements > 0) {
    stats.anyTypesReplaced += replacements;
    console.log(`   Replaced ${replacements} 'any' types with 'unknown' in ${path.relative(process.cwd(), fileP)}`);
  }
}

/**
 * Organize imports alphabetically and remove duplicates
 */
function organizeImports(fileP: string) {
  const sourceFile = project.getSourceFile(fileP);
  if (!sourceFile) return;

  const imports = sourceFile.getImportDeclarations();
  if (imports.length === 0) return;

  const importStructures: OptionalKind<ImportDeclarationStructure>[] = [];
  const seen = new Set<string>();

  for (const imp of imports) {
    const moduleSpecifier = imp.getModuleSpecifierValue();
    const key = `${moduleSpecifier}:${imp
      .getNamedImports()
      .map((n) => n.getName())
      .join(",")}`;

    if (!seen.has(key)) {
      seen.add(key);
      importStructures.push({
        moduleSpecifier,
        namedImports: imp.getNamedImports().map((n) => n.getName()),
        defaultImport: imp.getDefaultImport()?.getText(),
        namespaceImport: imp.getNamespaceImport()?.getText(),
      });
    }
  }

  // Sort imports: node modules, then @ aliases, then relative
  importStructures.sort((a, b) => {
    const aSpec = a.moduleSpecifier || "";
    const bSpec = b.moduleSpecifier || "";

    const aIsNode = !aSpec.startsWith(".") && !aSpec.startsWith("@/");
    const bIsNode = !bSpec.startsWith(".") && !bSpec.startsWith("@/");
    const aIsAlias = aSpec.startsWith("@/");
    const bIsAlias = bSpec.startsWith("@/");

    if (aIsNode && !bIsNode) return -1;
    if (!aIsNode && bIsNode) return 1;
    if (aIsAlias && !bIsAlias) return -1;
    if (!aIsAlias && bIsAlias) return 1;

    return aSpec.localeCompare(bSpec);
  });

  // Remove existing imports and add sorted ones
  if (importStructures.length !== imports.length || importStructures.length > 0) {
    for (const imp of imports) imp.remove();
    sourceFile.addImportDeclarations(importStructures);
    stats.importsOrganized++;
    console.log(`   Organized imports in ${path.relative(process.cwd(), fileP)}`);
  }
}

/**
 * Main refactoring function
 */
async function refactor() {
  console.log("🔧 AST Refactoring Tool");
  console.log("========================\n");

  const sourceFiles = project.getSourceFiles(["src/**/*.ts", "src/**/*.tsx", "!src/**/*.test.ts", "!src/**/*.spec.ts"]);

  console.log(`Found ${sourceFiles.length} files to process\n`);

  for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();

    // Apply refactorings
    organizeImports(filePath);
    replaceAnyTypes(filePath);

    stats.filesProcessed++;
  }

  // Save all changes
  await project.save();

  console.log("\n✅ Refactoring Complete");
  console.log("=======================");
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Any types replaced: ${stats.anyTypesReplaced}`);
  console.log(`Files with organized imports: ${stats.importsOrganized}`);
  console.log(`Unused vars removed: ${stats.unusedVarsRemoved}\n`);
}

refactor().catch((error) => {
  console.error("❌ Error during refactoring:", error);
  process.exit(1);
});
