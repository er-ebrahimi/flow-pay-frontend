# Next.js Testing Standards

Sourced from the official Next.js testing guidance + Google's test-pyramid philosophy (small/medium/large), the industry standard most FAANG-style orgs actually follow. Because untested code is just a bug you haven't met yet.

---

## 1. Test Pyramid (the ratio that matters)

| Google term | Common term | % of suite | Speed  | Scope                                              |
| ----------- | ----------- | ---------: | ------ | -------------------------------------------------- |
| Small       | Unit        |       ~70% | ms     | Single function/component, no I/O, no network      |
| Medium      | Integration |       ~20% | ms–sec | Component/module + mocked external dependencies    |
| Large       | E2E         |       ~10% | sec    | Full Next.js app through a real browser/HTTP layer |

Rule of thumb: if you're writing more E2E tests than unit tests, you're doing it backwards — slow, flaky, and expensive to maintain.

---

## 2. Tooling

* **Test runner**: Vitest (or Jest if the project already standardizes on it)
* **React/component testing**: React Testing Library
* **E2E testing**: Playwright
* **DOM environment**: `jsdom` for component/unit tests
* **Mocking**: Vitest mocks (`vi.mock`, `vi.fn`, `vi.spyOn`)
* **Next.js testing**: Test components, hooks, utilities, Server Actions, API Route Handlers, and application behavior independently.

Typical installation:

```bash
npm i --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom playwright
```

---

## 3. File & Naming Conventions

* Unit/component tests: live **next to** the file they test → `cats.service.spec.ts`, `CatCard.test.tsx`
* Integration tests: live next to the feature or inside a dedicated `tests/` directory.
* E2E tests: live in the top-level `e2e/` directory → `cats.spec.ts`
* Suffix rules:

  * `.test.ts` / `.test.tsx` for unit and integration tests
  * `.spec.ts` / `.spec.tsx` is also acceptable if the project standardizes on it
  * Playwright E2E tests → `.spec.ts`
* One `describe()` block per component/module when appropriate, with nested `describe()` blocks for distinct behaviors.

---

## 4. Unit Testing Rules

1. **Isolate the unit.** No real database, no real HTTP, no filesystem, and no external services. Mock external collaborators.

2. Test framework-independent logic directly. For React components, render through **React Testing Library** rather than manually calling component functions.

3. Follow **Arrange-Act-Assert (AAA)**:

```tsx
it('should render the cats returned by the API', async () => {
  // Arrange
  const cats = ['Milo', 'Luna'];

  vi.spyOn(catsService, 'findAll').mockResolvedValue(cats);

  // Act
  render(<CatsList />);

  // Assert
  expect(await screen.findByText('Milo')).toBeInTheDocument();
  expect(await screen.findByText('Luna')).toBeInTheDocument();
});
```

4. Mock external dependencies with `vi.mock()`, `vi.fn()`, or dependency injection through props/functions where possible.

5. Avoid mocking React, Next.js internals, or framework behavior unless there is a specific reason. Test your application's behavior instead.

6. One assertion concept per test. If your test name has "and" in it, split it.

7. **Test behavior, not implementation.** Don't assert on internal component state, private functions, DOM implementation details, or specific React internals.

8. Prefer accessible queries:

```tsx
screen.getByRole('button', { name: 'Submit' })
screen.getByLabelText('Email')
screen.getByText('Welcome')
```

Avoid relying on implementation-specific selectors such as:

```tsx
container.querySelector('.submit-button')
```

unless there is no better user-facing selector.

9. For async UI, use Testing Library's async utilities:

```tsx
await screen.findByText('Success');
await waitFor(() => {
  expect(...).toBe(...);
});
```

---

## 5. Integration Testing Rules

1. Test real application pieces together — for example, a component with its hooks/utilities, a Server Action with its validation logic, or an API Route Handler with its business logic.

2. Mock the **boundary** dependencies:

   * Database clients
   * External APIs
   * Payment providers
   * Email providers
   * Authentication providers

3. Use this layer to verify wiring:

   * Does the component interact correctly with its dependencies?
   * Does the Server Action validate and process the request correctly?
   * Does the API Route Handler return the correct HTTP response?
   * Are errors propagated correctly?
   * Are authentication/authorization checks applied?

4. Don't hit a shared development database.

5. For persistence behavior that genuinely requires a database, use an isolated test database or Testcontainers-backed ephemeral database.

6. Keep integration tests focused on interactions between multiple pieces. Don't duplicate every unit-test case here.

---

## 6. E2E Testing Rules

1. Use **Playwright** to run the application in a real browser.

2. Start the Next.js application and test through the real user-facing interface:

```ts
test('user can create a cat', async ({ page }) => {
  await page.goto('/cats');

  await page.getByRole('button', { name: 'Create Cat' }).click();

  await page.getByLabel('Name').fill('Milo');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Milo')).toBeVisible();
});
```

3. Test real user journeys rather than implementation details.

4. Use E2E tests for critical flows such as:

   * Authentication
   * Registration
   * Login/logout
   * Create → update → delete
   * Checkout/payment
   * Important forms
   * Authorization
   * Critical navigation flows

5. Mock only external systems that should not be contacted during tests, such as real payment gateways or third-party APIs. The goal is to test the real Next.js application, not a collection of mocks.

6. Keep E2E tests independent. A test should not depend on another test having run first.

7. Clean up test data after tests or use isolated test data.

8. Avoid testing every possible permutation through E2E — that's what unit and integration tests are for.

---

## 7. Coverage

* Target **80%+** line coverage as the "good" bar, 90%+ for critical modules (auth, payments, anything touching money or PII).
* Never chase 100% by excluding files from the coverage config — that's lying to your future self.
* Check coverage gaps with:

```bash
npm run test:cov
```

* Prioritize untested **branches and behaviors**, not just untested lines.
* Don't use coverage percentage as the only measure of test quality.
* A test suite with 90% coverage can still miss critical user behavior.

---

## 8. Mocking Discipline

* Prefer explicit dependency mocking with `vi.mock()`, `vi.fn()`, and `vi.spyOn()` over complicated global mocks.
* Don't mock what you don't own carelessly (3rd-party SDKs). Wrap external SDKs behind your own service/module when practical, then mock your wrapper.
* Mock network requests at the network boundary when appropriate.
* Keep reusable mock factories in a shared:

```text
test/
  mocks/
```

or:

```text
__mocks__/
```

directory.

* Don't copy-paste the same API, service, or user mock into 15 test files.
* Keep mocks as small as possible. A mock should represent only the behavior required by the test.
* Don't mock the component you're actually trying to test.

---

## 9. CI Requirements

Example scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

* `test` (unit + integration) + `test:e2e` must both pass before merge.
* Coverage report is a required CI artifact, not optional.
* No skipped tests or `.only()` tests allowed to merge — that's how a "temporary" skip lives in prod for two years.
* E2E tests should run against a production-like Next.js build when practical:

```bash
npm run build
npm run start
```

* CI should fail when tests fail.
* Test failures should be reproducible locally whenever possible.

---

## References

* Official Next.js documentation: https://nextjs.org/docs
* Next.js Testing documentation: https://nextjs.org/docs/app/guides/testing
* React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
* Playwright: https://playwright.dev/
* Google Testing Blog — Test Sizes: https://testing.googleblog.com/2010/12/test-sizes.html
* "Software Engineering at Google" — Ch. 11–14 (Testing Overview, Unit Testing, Test Doubles, Larger Testing): https://abseil.io/resources/swe-book/html/ch14.html
