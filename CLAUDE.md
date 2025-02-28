# UTCP Codebase Guide

## Build & Test Commands
- Build: `npm run build` (Compiles TypeScript)
- Lint: `npm run lint` (ESLint)
- Test all: `npm test` (Jest)
- Test single: `npx jest path/to/test.test.ts` or `npx jest -t "test description"`

## Code Style Guidelines
- **Naming**: Classes/Interfaces: PascalCase; Methods/Variables: camelCase; Constants: UPPER_CASE
- **Imports**: Use named exports/imports, group by module, use index.ts for public API
- **Types**: Define interfaces for all data structures, use explicit return types
- **Error handling**: Try/catch with descriptive messages, early validation of inputs
- **Structure**: Small, focused utility functions, clear separation of concerns
- **Documentation**: JSDoc for public methods and classes
- **Testing**: Jest tests named with `.test.ts` suffix, clear test descriptions

## TypeScript Config
- Strict mode enabled
- Target: ES2019
- Module: CommonJS
- Declaration files generated