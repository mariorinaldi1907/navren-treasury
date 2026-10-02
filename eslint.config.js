import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
export default tseslint.config(
  { ignores: ['node_modules/**','dist/**','work/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['src/**/*.{ts,tsx}','tests/**/*.ts'], plugins: {'react-hooks':reactHooks}, rules:{...reactHooks.configs.recommended.rules} }
);
