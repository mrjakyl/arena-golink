// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Directory } from "@/components/directory";
import type { GoLink } from "@/lib/types";
import { Providers } from "@/components/providers";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
afterEach(cleanup);

const link: GoLink = {
  name: "wiki", url: "https://docs.example/", description: "Team handbook",
  createdAt: "2026-09-24T00:00:00.000Z", updatedAt: "2026-09-24T00:00:00.000Z",
};

it("reflects new server data without remounting and searches descriptions", () => {
  const { rerender } = render(<Directory links={[link]} />, { wrapper: Providers });
  expect(screen.getByText("Team handbook")).toBeTruthy();
  fireEvent.change(screen.getByRole("textbox", { name: "Search links" }), { target: { value: "handbook" } });
  expect(screen.getByText("go/wiki")).toBeTruthy();
  rerender(<Directory links={[{ ...link, description: "Engineering runbook" }]} />);
  expect(screen.getByText("No links match “handbook”.")).toBeTruthy();
  fireEvent.change(screen.getByRole("textbox", { name: "Search links" }), { target: { value: "runbook" } });
  expect(screen.getByText("Engineering runbook")).toBeTruthy();
  rerender(<Directory links={[]} />);
  expect(screen.getByRole("link", { name: "New link" })).toBeTruthy();
  expect(screen.queryByText("go/wiki")).toBeNull();
});
