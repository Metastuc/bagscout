import { defineConfig } from "oxfmt";

export default defineConfig({
  endOfLine: "crlf",
  printWidth: 150,
  semi: true,
  singleQuote: false,
  tabWidth: 4,
  trailingComma: "all",
  useTabs: false,

  sortImports: {
    groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
    ignoreCase: true,
    internalPattern: ["@acme/", "#/", "@/*"],
    newlinesBetween: true,
  },

  sortPackageJson: true,

  sortTailwindcss: {
    preserveWhitespace: true,
    tailwindStylesheet: "./src/index.css",
    tailwindFunctions: ["clsx", "cva", "twMerge"],
  },
});
