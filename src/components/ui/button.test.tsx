import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { Button } from "./button";

it("renders the default Button as a pill", () => {
  render(<Button>Ok</Button>);
  expect(screen.getByRole("button", { name: "Ok" })).toHaveClass("rounded-full");
});
