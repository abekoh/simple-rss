# E2E Tests for Simple RSS

This directory contains end-to-end tests for the Simple RSS application using Playwright.

## Setup

1. Install dependencies:
```bash
cd e2e
pnpm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### All Tests
```bash
pnpm test
```

### Headed Mode (with browser visible)
```bash
pnpm test:headed
```

### Debug Mode (step through tests)
```bash
pnpm test:debug
```

### View Test Report
```bash
pnpm report
```

## Test Structure

The tests are organized into the following categories:

### `landing-page.spec.ts`
Tests for the main landing page functionality:
- Header display
- Navigation elements
- Feed addition form
- Authentication state
- Mobile responsiveness
- Basic page structure

### `navigation.spec.ts`
Tests for navigation between different sections:
- Navigation between main sections
- Active state highlighting
- Browser back/forward functionality
- Mobile drawer navigation
- Page state preservation

### `feed-management.spec.ts`
Tests for feed management features:
- Feed addition form
- URL validation
- Loading states
- Feed list display
- Mobile compatibility

### `responsive-design.spec.ts`
Tests for responsive design across different viewports:
- Desktop layout
- Mobile layout
- Tablet layout
- Viewport changes
- Touch interactions
- Cross-device functionality

### `authentication.spec.ts`
Tests for authentication features:
- Login/logout buttons
- Authentication states
- Error handling
- State persistence
- Content based on auth state

## Test Configuration

The tests are configured to:
- Run against `http://localhost:5173` (Vite dev server)
- Test on multiple browsers (Chrome, Firefox, Safari)
- Include mobile viewports
- Automatically start the web server
- Generate HTML reports

## Prerequisites

Before running tests, ensure:
1. The backend server is running (if testing with real data)
2. The frontend development server can be started
3. All necessary environment variables are set

### For CI/GitHub Actions

The E2E tests are automatically run in GitHub Actions when changes are made to:
- `web/**` (frontend code)
- `backend/**` (backend code)  
- `e2e/**` (E2E test code)
- `.github/workflows/e2e.yml` (workflow file)

The CI environment:
- Uses PostgreSQL for the database
- Disables authentication for testing
- Seeds test data automatically
- Runs tests on multiple browsers

## Notes

- Tests are designed to work with the current application structure
- Some tests may need GraphQL mocking for complete isolation
- Authentication tests require Auth0 configuration for full functionality
- Mobile tests use various viewport sizes to ensure compatibility