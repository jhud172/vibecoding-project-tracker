import { Component } from "react";
import { buttonClass } from "./ui";
import { rawStorageValues } from "./rawRecovery.js";

export class ErrorBoundary extends Component {
  state = { failed: false, message: "" };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  download = () => {
    try {
      const values = rawStorageValues(localStorage);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(values, null, 2)], {
          type: "application/json",
        }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "relay-recovery-raw.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.setState({
        message:
          "Raw recovery download requested. Keep it private; it includes saved context and drafts.",
      });
    } catch {
      this.setState({
        message:
          "Browser storage cannot be read. Keep this browser profile intact and retry with storage enabled.",
      });
    }
  };
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section
        role="alert"
        className="m-6 max-w-xl rounded-xl border border-line bg-surface-page p-6 text-text-primary"
      >
        <h1 className="text-2xl font-semibold">
          Relay could not display this view.
        </h1>
        <p className="my-4 text-sm">
          Your saved browser data has not been reset. Download a recovery copy,
          then reload the page.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className={buttonClass} onClick={this.download}>
            Download raw recovery data
          </button>
          <button className={buttonClass} onClick={() => location.reload()}>
            Reload Relay
          </button>
          {this.props.onClose && (
            <button className={buttonClass} onClick={this.props.onClose}>
              Return to workspace
            </button>
          )}
        </div>
        {this.state.message && (
          <p className="mt-3 text-sm">{this.state.message}</p>
        )}
      </section>
    );
  }
}
