import { Component, type ReactNode } from "react";
import { Wrench } from "lucide-react";
import { logError } from "../lib/tracking";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    void logError(error.message, { stack: error.stack, source: "boundary" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center"
             style={{ background: "var(--bg)", color: "var(--text)" }}>
          <span className="mb-3" style={{ color: "var(--brand)" }}><Wrench size={44} /></span>
          <h1 className="font-display text-xl font-bold">משהו השתבש</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            התקלה תועדה ואנחנו נטפל בה. אפשר לרענן ולהמשיך.
          </p>
          <button onClick={() => window.location.reload()}
            className="btn btn-primary mt-5">רענון העמוד</button>
        </div>
      );
    }
    return this.props.children;
  }
}
