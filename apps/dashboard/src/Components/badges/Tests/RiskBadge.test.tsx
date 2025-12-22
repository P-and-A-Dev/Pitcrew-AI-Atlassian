import { describe, it, expect } from "vitest";
import { getRiskConfig } from "../RiskBadge";
import { render, screen } from "@testing-library/react";
import { RiskBadge } from "../RiskBadge";

describe("getRiskConfig", () => {
    it("returns High risk for high score", () => {
        const result = getRiskConfig(80);

        expect(result.label).toBe("High");
        expect(result.className).toContain("text-red");
    });

    it("returns Medium risk for medium score", () => {
        const result = getRiskConfig(50);

        expect(result.label).toBe("Medium");
        expect(result.className).toContain("text-yellow");
    });

    it("returns Low risk for low score", () => {
        const result = getRiskConfig(20);

        expect(result.label).toBe("Low");
        expect(result.className).toContain("text-green");
    });

    it("maps string levels correctly", () => {
        expect(getRiskConfig("high").label).toBe("High");
        expect(getRiskConfig("medium").label).toBe("Medium");
        expect(getRiskConfig("low").label).toBe("Low");
    });

});
describe("RiskBadge component", () => {
    it("renders High label when score is high", () => {
        render(<RiskBadge score={90} />);
        expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("renders Medium label when level is medium", () => {
        render(<RiskBadge level="medium" />);
        expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("renders Low label when level is low", () => {
        render(<RiskBadge level="low" />);
        expect(screen.getByText("Low")).toBeInTheDocument();
    });
});


