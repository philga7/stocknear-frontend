# StockNear Frontend Development Standards

## Project Overview

**StockNear** is a SvelteKit-based stock analysis and community platform for small investors. The application provides real-time stock data, advanced charting, social features, premium subscriptions, and comprehensive market analysis tools.

**Technology Stack:**
- SvelteKit with TypeScript
- Tailwind CSS with DaisyUI
- Highcharts and Plotly.js for data visualization
- PocketBase for backend services
- Playwright for E2E testing, Vitest for unit testing
- Web workers for background tasks

## Project Architecture

### Directory Structure Standards

**Core Directories:**
- `/src/routes/` - SvelteKit routing (pages and API endpoints)
- `/src/lib/components/` - Reusable Svelte components
- `/src/lib/assets/` - Static assets (images, fonts, audio)
- `/src/lib/store.ts` - Centralized Svelte stores
- `/static/` - Static files served by SvelteKit
- `/tests/` - Test files (Playwright E2E tests)

**Component Organization:**
- Feature-based subdirectories in `/src/lib/components/`
- shadcn/ui components in `/src/lib/components/shadcn/`
- Specialized components (Dashboard, Options, etc.) in dedicated folders

### File Naming Conventions

**MUST FOLLOW:**
- **Components**: PascalCase (e.g., `AddToWatchlist.svelte`)
- **Routes**: kebab-case (e.g., `dark-pool-flow/`)
- **API endpoints**: kebab-case (e.g., `create-watchlist/`)
- **Assets**: kebab-case with descriptive names
- **Stores**: camelCase (e.g., `loginData`, `currentPrice`)

**PROHIBITED:**
- Spaces in filenames
- Special characters except hyphens and underscores
- Generic names like `component.svelte` or `page.svelte`

## Code Standards

### TypeScript Requirements

**MANDATORY:**
- Use TypeScript for all `.ts` and `.svelte` files
- Define proper types for all function parameters and return values
- Use type imports: `import type { RequestHandler } from "./$types"`
- Define interfaces for API responses and component props

**PROHIBITED:**
- `any` types without explicit justification
- Unused imports or variables
- Implicit type declarations

### Import Standards

**MUST USE:**
- `$lib/` alias for internal imports: `import Component from "$lib/components/Component.svelte"`
- Relative imports for same-directory files
- Named imports for utilities: `import { writable } from "svelte/store"`

**ICON IMPORTS:**
```typescript
import Home from "lucide-svelte/icons/house";
import Menu from "lucide-svelte/icons/menu";
```

### Component Structure

**REQUIRED PATTERN:**
```svelte
<script lang="ts">
  // 1. External imports
  import { writable } from "svelte/store";
  
  // 2. Internal imports ($lib)
  import Component from "$lib/components/Component.svelte";
  
  // 3. Props and reactive declarations
  export let data: any;
  let localVar = "";
  
  // 4. Functions
  function handleClick() {
    // Implementation
  }
</script>

<!-- Template -->
<div class="container">
  <Component {data} />
</div>

<style>
  /* Scoped styles only */
</style>
```

### Store Management

**CENTRALIZED STORES:**
- All stores defined in `/src/lib/store.ts`
- Use `writable` for reactive state
- Implement cache expiration (5 minutes default)
- Clear cache when needed: `clearCache()`

**STORE PATTERNS:**
```typescript
export const storeName = writable<Type>(initialValue);
export const setCache = (key: string, data: any, name: string) => {
  // Implementation with timestamp
};
```

### API Route Standards

**REQUIRED STRUCTURE:**
```typescript
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
  // 1. Extract data
  const { apiURL, apiKey, user, pb } = locals;
  const data = await request.json();
  
  // 2. Validation
  if (!data.requiredField) {
    return new Response(
      JSON.stringify({ error: "Missing required field" }),
      { status: 400 }
    );
  }
  
  // 3. Business logic
  try {
    // Implementation
    return new Response(JSON.stringify(result));
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};
```

**ERROR HANDLING:**
- Always return proper HTTP status codes
- Include descriptive error messages
- Log errors for debugging
- Handle streaming responses properly

## Functionality Implementation Standards

### Component Development

**REQUIRED PATTERNS:**
- Use Tailwind CSS classes for styling
- Implement responsive design with mobile-first approach
- Use shadcn/ui components for consistent UI
- Handle loading and error states
- Implement proper accessibility attributes

**PROHIBITED:**
- Inline styles except for dynamic values
- Global CSS unless absolutely necessary
- Direct DOM manipulation without Svelte bindings

### Data Visualization

**CHART LIBRARIES:**
- **Highcharts**: For complex financial charts and technical analysis
- **Plotly.js**: For interactive data visualization
- **Custom charts**: Use SVG for simple visualizations

**REQUIRED:**
- Responsive chart containers
- Loading states for data fetching
- Error handling for failed data loads
- Accessibility labels and descriptions

### Web Workers

**BACKGROUND TASKS:**
- Use web workers for notification handling
- Implement fallback for non-worker environments
- Handle worker message communication properly
- Clean up workers on component destruction

**PATTERN:**
```typescript
const loadWorker = async () => {
  if ("serviceWorker" in navigator) {
    const Worker = await import("$lib/workers/notificationWorker?worker");
    worker = new Worker.default();
    worker.onmessage = handleMessage;
  } else {
    await fallbackWorker();
  }
};
```

### Asset Management

**ORGANIZATION:**
- Images: `/src/lib/assets/images/` with subdirectories by category
- Fonts: `/src/lib/assets/fonts/`
- Audio: `/src/lib/assets/audio/`
- Icons: Use lucide-svelte, avoid custom SVGs unless necessary

**OPTIMIZATION:**
- Compress images before adding to assets
- Use appropriate formats (WebP for photos, SVG for icons)
- Implement lazy loading for large assets

## Framework/Plugin Standards

### SvelteKit Configuration

**REQUIRED SETTINGS:**
- Use `@sveltejs/adapter-node` for production
- Enable compression middleware
- Configure proper paths with `relative: false`
- Use Vite preprocessor for TypeScript

### Tailwind CSS Usage

**MANDATORY:**
- Use utility classes for styling
- Implement dark mode with `mode-watcher`
- Use DaisyUI components for consistent design
- Follow mobile-first responsive design

**CUSTOM COMPONENTS:**
```typescript
const buttonVariants = tv({
  base: "cursor-pointer inline-flex items-center...",
  variants: {
    variant: {
      default: "bg-white dark:bg-default text-muted dark:text-white",
      // Other variants
    }
  }
});
```

### Testing Standards

**E2E TESTING (Playwright):**
- Test critical user flows
- Test responsive design across devices
- Test accessibility features
- Test error scenarios

**UNIT TESTING (Vitest):**
- Test utility functions
- Test store logic
- Test component logic where applicable

## Workflow Standards

### Development Process

**REQUIRED STEPS:**
1. **Component Creation**: Create in appropriate subdirectory
2. **Type Definition**: Define TypeScript interfaces
3. **Implementation**: Follow component structure pattern
4. **Styling**: Use Tailwind classes, implement responsive design
5. **Testing**: Add unit tests for logic, E2E tests for flows
6. **Documentation**: Update relevant documentation

### API Development

**REQUIRED STEPS:**
1. **Route Creation**: Create in `/src/routes/api/`
2. **Type Definition**: Define request/response types
3. **Validation**: Implement input validation
4. **Error Handling**: Proper HTTP status codes and messages
5. **Testing**: Test with various inputs and error conditions

### Asset Integration

**REQUIRED STEPS:**
1. **Optimization**: Compress and optimize assets
2. **Organization**: Place in appropriate subdirectory
3. **Import**: Use proper import paths
4. **Responsive**: Ensure assets work on all screen sizes

## Key File Interaction Standards

### Multi-File Coordination

**WHEN MODIFYING COMPONENTS:**
- Update related stores in `/src/lib/store.ts` if state changes
- Update API routes if data flow changes
- Update tests if functionality changes
- Update documentation if public API changes

**WHEN MODIFYING API ROUTES:**
- Update frontend components that consume the API
- Update TypeScript types if response structure changes
- Update tests for new endpoints
- Update error handling in consuming components

**WHEN MODIFYING STORES:**
- Update all components that subscribe to the store
- Update cache management if needed
- Update tests for store logic
- Consider impact on performance

### Configuration Changes

**WHEN MODIFYING CONFIGURATION:**
- Update `svelte.config.js` for build changes
- Update `playwright.config.ts` for test changes
- Update `package.json` for dependency changes
- Update deployment scripts if needed

## AI Decision-Making Standards

### Priority Decision Tree

**HIGH PRIORITY (Fix Immediately):**
- Security vulnerabilities
- Critical functionality broken
- Performance issues affecting user experience
- Accessibility violations

**MEDIUM PRIORITY (Plan Implementation):**
- Code quality improvements
- Performance optimizations
- Feature enhancements
- UI/UX improvements

**LOW PRIORITY (Consider Later):**
- Code refactoring without functional changes
- Documentation updates
- Minor styling adjustments

### Component Creation Decision Tree

**NEW COMPONENT NEEDED WHEN:**
- Functionality is reusable across multiple pages
- Complex UI logic that should be encapsulated
- State management that affects multiple components
- Third-party library integration

**INLINE COMPONENT ACCEPTABLE WHEN:**
- Simple, page-specific UI elements
- One-time use components
- Quick prototypes or experiments

### API Design Decision Tree

**NEW API ENDPOINT NEEDED WHEN:**
- New data operations not covered by existing endpoints
- Different data format requirements
- Performance optimization for specific use cases
- Security requirements differ from existing endpoints

**MODIFY EXISTING ENDPOINT WHEN:**
- Adding optional parameters
- Extending response data
- Improving error handling
- Performance optimizations

## Prohibited Actions

### Code Quality Prohibitions

**STRICTLY PROHIBITED:**
- Using `any` type without explicit justification
- Console.log statements in production code
- Hardcoded values instead of configuration
- Direct DOM manipulation bypassing Svelte
- Global CSS unless absolutely necessary
- Unused imports or variables
- Inconsistent naming conventions

### Security Prohibitions

**STRICTLY PROHIBITED:**
- Exposing sensitive data in client-side code
- Storing API keys in frontend code
- Bypassing authentication checks
- Trusting user input without validation
- Using deprecated or vulnerable dependencies

### Performance Prohibitions

**STRICTLY PROHIBITED:**
- Large bundle sizes without code splitting
- Unoptimized images or assets
- Blocking operations in main thread
- Memory leaks from unsubscribed stores
- Unnecessary re-renders

### Architecture Prohibitions

**STRICTLY PROHIBITED:**
- Breaking SvelteKit conventions
- Mixing different styling approaches
- Duplicating functionality across components
- Creating circular dependencies
- Violating single responsibility principle

## File-Specific Standards

### Critical Files

**`/src/lib/store.ts`:**
- Central store management only
- No business logic in stores
- Proper TypeScript types for all stores
- Cache management with expiration

**`/src/routes/+layout.svelte`:**
- Global layout and navigation
- Theme management
- Global state initialization
- Error boundary implementation

**`/src/app.css`:**
- Global styles only
- Tailwind directives
- Custom CSS variables
- No component-specific styles

### Component Categories

**UI COMPONENTS (`/src/lib/components/shadcn/`):**
- Reusable UI primitives
- Consistent design system
- Proper TypeScript interfaces
- Accessibility compliance

**FEATURE COMPONENTS (`/src/lib/components/[Feature]/`):**
- Feature-specific functionality
- Integration with stores
- API communication
- Error handling

**PAGE COMPONENTS (`/src/routes/[page]/+page.svelte`):**
- Page-specific layout
- Data fetching and loading states
- Route-specific logic
- SEO optimization

## Testing Standards

### Test Organization

**E2E TESTS (`/tests/`):**
- Critical user journeys
- Cross-browser compatibility
- Responsive design testing
- Performance testing

**UNIT TESTS:**
- Utility functions
- Store logic
- Component logic
- API route handlers

### Test Patterns

**REQUIRED:**
- Descriptive test names
- Proper setup and teardown
- Mock external dependencies
- Test error scenarios
- Test edge cases

**PROHIBITED:**
- Testing implementation details
- Brittle tests that break with refactoring
- Tests without assertions
- Tests that depend on external services

## Deployment Standards

### Build Process

**REQUIRED:**
- TypeScript compilation
- Asset optimization
- Code splitting
- Bundle analysis
- Performance monitoring

### Environment Configuration

**REQUIRED:**
- Environment-specific settings
- Secure API key management
- Feature flags for gradual rollouts
- Monitoring and logging setup

## Maintenance Standards

### Code Review Checklist

**MANDATORY CHECKS:**
- TypeScript compliance
- Component structure adherence
- Store usage patterns
- API error handling
- Performance considerations
- Accessibility compliance
- Test coverage

### Refactoring Guidelines

**WHEN REFACTORING:**
- Maintain backward compatibility
- Update all related files
- Update tests
- Update documentation
- Consider performance impact
- Validate in multiple browsers

## Task Management Memory

**CRITICAL RULE FOR AI AGENTS:**
- **ALL NEW TASKS MUST BE APPENDED** to existing completed tasks
- **NEVER REPLACE** or clear existing completed tasks
- **PRESERVE TASK HISTORY** - completed tasks serve as project memory and context
- **MAINTAIN CONTINUITY** - new tasks build upon previous work, not replace it

**TASK APPENDITION PATTERN:**
- When creating new tasks, use `append` mode in task management
- Reference existing completed tasks for context and dependencies
- Build upon previous work rather than starting fresh
- Maintain task history for project continuity and learning

This document serves as the definitive guide for AI agents working on the StockNear frontend project. All development must strictly adhere to these standards to maintain code quality, consistency, and project integrity. 