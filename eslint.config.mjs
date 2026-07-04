import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Philosophy: ESLint catches bugs, Prettier owns formatting entirely, and
  // we skip the type-aware "strict" tiers (nextTs already uses plain
  // typescript-eslint `recommended`, not `strictTypeChecked` - no change
  // needed there).
  {
    rules: {
      // eslint-plugin-react-hooks 7.x's "recommended" (pulled in by
      // eslint-config-next) bundles ~14 React Compiler correctness rules
      // (purity, immutability, static-components, etc.). They only earn
      // their keep once the Compiler is actually turned on - keep just the
      // two that catch real bugs regardless of Compiler usage.
      'react-hooks/static-components': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/unsupported-syntax': 'off',
      'react-hooks/config': 'off',
      'react-hooks/gating': 'off',

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

  eslintConfigPrettier, // must stay last - turns off stylistic rules Prettier owns

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
