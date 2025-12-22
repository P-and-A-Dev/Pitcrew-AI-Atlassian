import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTelemetry } from "../../../hooks/useTelemetry";
import { invoke } from "@forge/bridge";


vi.mock("@forge/bridge", () => ({
    invoke: vi.fn(),
}));

afterEach(() => {
    vi.restoreAllMocks();
    delete (window as any).AP;
});

describe("useTelemetry", () => {
    it("loads telemetry data from local fallback", async () => {
        const { result } = renderHook(() => useTelemetry());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data.length).toBe(2);
        expect(result.current.data[0].title).toBe(
            "Refactor auth middleware"
        );
        expect(result.current.error).toBeNull();
    });

    it("sets error when Forge response is invalid", async () => {

        (window as any).AP = true;

        (invoke as any).mockResolvedValueOnce(null);

        const { result } = renderHook(() => useTelemetry());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe(
            "Failed to load telemetry data"
        );
        expect(result.current.data).toEqual([]);
    });
});
