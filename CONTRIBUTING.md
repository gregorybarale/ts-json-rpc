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

### Git Flow Workflow

This project follows the **Git Flow** workflow for organized development and releases.

#### Branch Structure

We maintain two primary branches:
- **`main`**: Production-ready code with official release history
- **`develop`**: Integration branch where features are merged for testing

#### Branch Types and Naming Conventions

1. **Feature Branches**
   - **Prefix**: `feature/`
   - **Created from**: `develop`
   - **Merged into**: `develop`
   - **Example**: `feature/batch-request-support`

2. **Release Branches** 
   - **Prefix**: `release/`
   - **Created from**: `develop`
   - **Merged into**: `main` and `develop`
   - **Example**: `release/0.2.0`

3. **Hotfix Branches**
   - **Prefix**: `hotfix/`
   - **Created from**: `main`
   - **Merged into**: `main` and `develop`
   - **Example**: `hotfix/critical-error-fix`

#### Git Flow Setup

1. **Install Git Flow** (optional but recommended):
   ```bash
   # macOS
   brew install git-flow-avh
   
   # Ubuntu/Debian
   sudo apt-get install git-flow
   
   # Windows
   # Download from: https://github.com/petervanderdoes/gitflow-avh
   ```

2. **Initialize Git Flow** (if using git-flow extensions):
   ```bash
   git flow init
   # Accept defaults: main/develop branches
   # Feature prefix: feature/
   # Release prefix: release/
   # Hotfix prefix: hotfix/
   ```

#### Development Workflow

##### For New Features

1. **Start a Feature**
   ```bash
   # With git-flow
   git flow feature start your-feature-name
   
   # Or manually
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Develop the Feature**
   - Follow coding standards
   - Add comprehensive tests
   - Update documentation
   - Ensure all checks pass

3. **Test Your Changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Finish the Feature**
   ```bash
   # With git-flow (creates PR to develop)
   git flow feature finish your-feature-name
   
   # Or manually
   git checkout develop
   git pull origin develop
   git merge feature/your-feature-name
   git branch -d feature/your-feature-name
   ```

##### For Releases

1. **Start a Release** (maintainers only)
   ```bash
   # With git-flow
   git flow release start 0.2.0
   
   # Or manually
   git checkout develop
   git pull origin develop
   git checkout -b release/0.2.0
   ```

2. **Prepare Release**
   - Update version numbers
   - Update CHANGELOG.md
   - Final testing and bug fixes
   - No new features

3. **Finish Release** (maintainers only)
   ```bash
   # With git-flow
   git flow release finish 0.2.0
   
   # Or manually
   git checkout main
   git merge release/0.2.0
   git tag -a v0.2.0 -m "Release version 0.2.0"
   git checkout develop  
   git merge release/0.2.0
   git branch -d release/0.2.0
   ```

##### For Hotfixes

1. **Start a Hotfix**
   ```bash
   # With git-flow
   git flow hotfix start critical-fix
   
   # Or manually
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-fix
   ```

2. **Fix the Issue**
   - Make minimal changes
   - Add regression tests
   - Update version number

3. **Finish Hotfix**
   ```bash
   # With git-flow
   git flow hotfix finish critical-fix
   
   # Or manually
   git checkout main
   git merge hotfix/critical-fix
   git tag -a v0.1.1 -m "Hotfix version 0.1.1"
   git checkout develop
   git merge hotfix/critical-fix
   git branch -d hotfix/critical-fix
   ```

#### Branch Protection Rules

- **`main`** branch is protected and requires:
  - Pull request reviews
  - All status checks passing
  - Up-to-date branches
  
- **`develop`** branch requires:
  - Pull request for feature merges
  - All tests passing

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