import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL's auto-cleanup only hooks into a global afterEach — with vitest
// globals off it never fires, and every render leaks into the next test.
afterEach(() => cleanup());
