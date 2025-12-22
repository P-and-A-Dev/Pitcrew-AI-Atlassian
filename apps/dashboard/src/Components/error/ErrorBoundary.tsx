import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
    };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.error("Unhandled UI error:", error);
    }

    handleRetry = () => {
        this.setState({ hasError: false });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
                    <div className="text-center space-y-4">
                        <h1 className="text-lg font-semibold">
                            Something went wrong
                        </h1>

                        <p className="text-sm opacity-70">
                            An unexpected error occurred while loading the dashboard.
                        </p>

                        <button
                            onClick={this.handleRetry}
                            className="px-4 py-2 text-sm rounded-md bg-white/10 hover:bg-white/20 transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
