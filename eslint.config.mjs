import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "indent": ["error", 2],
      "quotes": ["error", "single"],
      "no-unreachable": ["error"],
      "camelcase": ["error"],
      "default-case": ["error"],
      "eqeqeq": ["error", "always"],
      "max-lines": ["warn", { "max": 200, "skipComments": true }],
      "no-negated-condition": ["warn"],
      "yoda": ["error"],
      "object-curly-spacing": ["error", "always"],
      "space-before-blocks": "error",
      "semi": ["error", "always"],
      "comma-spacing": ["error", { "before": false, "after": true }],
      "max-len": [
        "error",
        {
          "code": 120,
          "ignoreUrls": true,
          "ignoreStrings": true,
          "ignoreTemplateLiterals": true,
          "ignoreRegExpLiterals": true,
          "ignoreComments": true
        }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  },
  {
    files: ["tests/**/*.test.ts", "tests/**/*.spec.ts"],
    rules: {
      "max-lines": "off"
    }
  }
];
