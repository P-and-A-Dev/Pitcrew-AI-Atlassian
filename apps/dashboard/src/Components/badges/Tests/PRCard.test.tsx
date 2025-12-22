import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PrCard } from "../../cards/PrCard";

describe("PrCard", () => {
    it("renders title, author and risk badge", () => {
        render(
            <PrCard
                title="Refactor auth middleware"
                author="alice"
                risk="high"
            />
        );

        expect(
            screen.getByText("Refactor auth middleware")
        ).toBeInTheDocument();

        expect(screen.getByText("by alice")).toBeInTheDocument();
        expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("renders loading state", () => {
        render(<PrCard loading />);

        expect(
            screen.getByLabelText("loading")
        ).toBeInTheDocument();
    });

    it("renders error state", () => {
        render(<PrCard error="Failed to load PR" />);

        expect(
            screen.getByText("Failed to load PR")
        ).toBeInTheDocument();
    });
});
