# Contributing to SinBullying

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn
- Git
- Vercel CLI (for local development)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SinBullying.git
   cd SinBullying
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Link to Vercel project:
   ```bash
   vercel link
   vercel env pull .env.local
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Write/update tests:
   ```bash
   npm run test
   npm run test:e2e
   ```

4. Run linting and formatting:
   ```bash
   npm run lint:fix
   npm run format
   ```

5. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add email notifications for new reports
fix: resolve file upload size limit issue
docs: update installation instructions
```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Define proper types, avoid `any`
- Use interfaces for objects
- Export types alongside components

### React
- Use functional components with hooks
- Keep components small and focused
- Use meaningful component and variable names
- Extract reusable logic into custom hooks

### Styling
- Use TailwindCSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors

## Testing

### Unit Tests
```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
```

### E2E Tests
```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # With UI
```

### Writing Tests
- Write tests for new features
- Update existing tests when changing behavior
- Aim for >80% code coverage
- Test edge cases and error scenarios

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**:
   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run test:e2e
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**:
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changes were made and why
   - Add screenshots for UI changes

6. **Code Review**:
   - Address reviewer feedback
   - Keep PR focused and small
   - Be responsive to comments

## Reporting Issues

### Bug Reports
Include:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, etc.)

### Feature Requests
Include:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach

## Security

If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. Email the maintainer directly
3. Provide detailed information
4. Allow time for a fix before public disclosure

## Questions?

Feel free to:
- Open a discussion on GitHub
- Join our community chat (if available)
- Contact the maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
