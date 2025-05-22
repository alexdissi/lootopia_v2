import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "new-cap": "off",

      "no-duplicate-imports": ["error", { includeExports: true }],
      "no-constant-binary-expression": "error",
      "no-constructor-return": "error",
      "no-new-native-nonconstructor": "error",
      "no-promise-executor-return": ["error", { allowVoid: true }],
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-unmodified-loop-condition": "error",
      "no-unreachable-loop": "error",
      "no-unused-private-class-members": "error",

      "arrow-body-style": ["error", "as-needed"],
      "class-methods-use-this": ["error", { enforceForClassFields: true }],
      "func-style": ["error", "declaration", { allowArrowFunctions: true }],
      "grouped-accessor-pairs": ["error", "getBeforeSet"],
      "logical-assignment-operators": [
        "error",
        "always",
        { enforceForIfStatements: true },
      ],
      "max-depth": ["error", 3],
      "max-params": ["error", 3],
      "no-alert": "error",
      "no-caller": "error",
      "no-empty-function": "error",
      "no-eval": "error",
      "no-extend-native": "error",
      "no-implicit-coercion": "error",
      "no-implied-eval": "error",
      "no-invalid-this": "error",
      "no-loop-func": "error",
      "no-multi-assign": "error",
      "no-new-func": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];

export default eslintConfig;