import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { userColumns } from "./columns";
import type { AdminUser } from "@/lib/types";

const base: AdminUser = {
  id: "1", email: "a@b.c", name: null, username: null, appRole: "user", badge: null,
  createdAt: 1, lastSeenAt: null, tripCount: 0, mediaCount: 0,
};
const cell = (u: AdminUser) => {
  const col = userColumns.find((c) => c.header === "Badge")!;
  render(<div data-testid="c">{col.cell!(u)}</div>);
  return screen.getByTestId("c");
};

describe("badge column", () => {
  it("renders Founder", () => expect(cell({ ...base, badge: "founder" })).toHaveTextContent("Founder"));
  it("renders First Edition", () => expect(cell({ ...base, badge: "first_edition" })).toHaveTextContent("First Edition"));
  it("renders nothing without badge", () => expect(cell(base)).toBeEmptyDOMElement());
});
