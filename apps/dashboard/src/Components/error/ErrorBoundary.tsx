import { Component, type ReactNode } from "react";

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

    componentDidCatch(error: unknown) {
        console.error("UI crash captured by ErrorBoundary:", error);
    }

    handleRetry = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#0A0F1F] text-white">
                    <div className="max-w-sm text-center space-y-4">
                        <h1 className="text-lg font-semibold">
                            Telemetry temporarily unavailable
                        </h1>

                        <p className="text-sm opacity-70">
                            Please retry in a few moments.
                        </p>

                        <button
                            onClick={this.handleRetry}
                            className="px-4 py-2 text-sm rounded-md bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
