import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// `server-only` throws outside a server bundle; tests run in jsdom/node.
vi.mock("server-only", () => ({}));
