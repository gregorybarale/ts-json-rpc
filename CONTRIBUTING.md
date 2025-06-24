# Contributing to ts-json-rpc

Thank you for your interest in contributing to ts-json-rpc! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm
- Git

### Development Environment Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ts-json-rpc.git
   cd ts-json-rpc
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build All Packages**
   ```bash
   npm run build
   ```

4. **Run Tests**
   ```bash
   npm test
   ```

5. **Verify Linting**
   ```bash
   npm run lint
   ```

## 🏗️ Project Structure

This is a TypeScript monorepo with three packages:

```
ts-json-rpc/
├── packages/
│   ├── core/          # Core types and utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── client/        # JSON-RPC client
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── server/        # JSON-RPC server
│       ├── src/
│       │   ├── index.ts
│       │   └── __tests__/
│       ├── package.json
│       └── tsconfig.json
├── .eslintrc.js       # ESLint configuration
├── .prettierrc.js     # Prettier configuration
├── tsconfig.json      # Base TypeScript configuration
└── package.json       # Root package with workspaces
```

## 🛠️ Development Guidelines

### Code Style

We use ESLint and Prettier to maintain consistent code style:

- **ESLint**: Enforces TypeScript best practices and import organization
- **Prettier**: Handles code formatting with 4-space indentation, single quotes, and trailing commas
- **TypeScript**: Strict mode enabled with comprehensive type checking

Run formatting and linting:
```bash
npm run format  # Format with Prettier
npm run lint    # Check with ESLint
```

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

**Examples:**
```
feat(client): add batch request support
fix(server): handle null id in error responses
docs(core): update README with new examples
test(server): add tests for notification handling
```

### Testing Guidelines

All packages must maintain high test coverage (80%+ target):

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test package interactions
- **Test Framework**: Vitest for fast, modern testing
- **Coverage**: Use `npm test` to run tests with coverage reporting

**Writing Tests:**
- Place tests in `__tests__` directories
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)

**Running Tests:**
```bash
npm test                                    # All packages
npm test --workspace=@ts-json-rpc/core     # Specific package
```

### Type Safety

This project prioritizes type safety:

- Use strict TypeScript configuration
- Avoid `any` types unless absolutely necessary
- Provide comprehensive type definitions
- Export all public types
- Use type guards for runtime type checking

## 📝 Making Changes

### Workflow

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Make Changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure builds pass

3. **Test Your Changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Guidelines

**Before Submitting:**
- Ensure all tests pass
- Update documentation if needed
- Add tests for new features
- Follow commit message conventions
- Rebase on latest main branch

**PR Description Should Include:**
- Clear description of changes
- Motivation for the changes
- Any breaking changes
- Testing instructions
- Related issue numbers

**PR Title:**
Use conventional commit format: `feat: add new feature`

## 🐛 Reporting Issues

### Bug Reports

Please include:
- **Environment**: Node.js version, OS, package versions
- **Steps to Reproduce**: Minimal reproduction case
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Additional Context**: Error messages, stack traces

### Feature Requests

Please include:
- **Use Case**: Why this feature is needed
- **Proposed Solution**: How it might work
- **Alternatives**: Other approaches considered
- **Additional Context**: Examples, references

## 🧪 Testing Strategy

### Coverage Requirements

- **Statements**: 80%+
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+

### Test Categories

1. **Core Package Tests**
   - Type creation functions
   - Type guard functions
   - Error creation utilities
   - Constants validation

2. **Client Package Tests**
   - Request/response handling
   - Error handling
   - Transport integration
   - Notification sending
   - Concurrent operations

3. **Server Package Tests**
   - Request parsing
   - Method dispatching
   - Error handling
   - Batch processing
   - Context passing
   - Logging

## 📚 Documentation

### Documentation Requirements

- **README Files**: Each package must have a comprehensive README
- **API Documentation**: JSDoc comments for all public APIs
- **Examples**: Working code examples in documentation
- **Type Definitions**: Exported TypeScript types

### Writing Documentation

- Use clear, concise language
- Provide working code examples
- Include both basic and advanced usage
- Document error conditions
- Keep documentation up to date with code changes

## 🏷️ Release Process

Releases are managed by maintainers:

1. Version bumping follows semantic versioning
2. All packages are versioned together
3. Changelog is generated from conventional commits
4. Releases are tagged and published to npm

## 💬 Getting Help

- **Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check package READMEs and code examples

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone.

### Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Enforcement

Project maintainers are responsible for clarifying standards and may take corrective action in response to unacceptable behavior.

## ⚖️ License

By contributing to ts-json-rpc, you agree that your contributions will be licensed under the same MIT license that covers the project.