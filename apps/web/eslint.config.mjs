import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  {
    files: [
      "src/app/**/page.ts",
      "src/app/**/page.tsx",
      "src/app/**/layout.ts",
      "src/app/**/layout.tsx",
      "src/app/**/default.ts",
      "src/app/**/default.tsx",
      "src/app/**/loading.ts",
      "src/app/**/loading.tsx",
      "src/app/**/error.ts",
      "src/app/**/error.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "@academy/db",
              message:
                "Page files should compose feature services or repositories instead of importing Prisma directly. Legacy pages may stay temporarily, but new code should follow the target boundary.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*.ts", "src/components/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          paths: [
            {
              name: "@academy/db",
              message:
                "UI components must stay data-access free. Move database reads into a feature service or repository.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
