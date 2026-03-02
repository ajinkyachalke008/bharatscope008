import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  prettierConfig,
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      '.tauri/**',
      'public/**',
      '*.png',
      '*.jpg',
      '*.svg',
      'pnpm-lock.yaml',
      'package-lock.json',
    ],
  },
);
