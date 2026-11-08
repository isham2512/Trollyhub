import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "var(--bg, #fcfdfe)",
          color: "var(--text, #0f172a)",
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            maxWidth: 480,
            width: "100%",
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: 20,
            padding: 32,
            boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: "#0f172a" }}>Something went wrong</h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5, marginBottom: 20 }}>
              An unexpected error occurred while rendering this section. Click below to recover.
            </p>
            {this.state.error && (
              <pre style={{
                background: "#f8fafc",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                color: "#ef4444",
                overflowX: "auto",
                textAlign: "left",
                marginBottom: 20,
                maxHeight: 120
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button 
                onClick={this.handleReset}
                style={{
                  padding: "10px 20px",
                  borderRadius: 50,
                  border: "1px solid #1a6640",
                  background: "#fff",
                  color: "#1a6640",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer"
                }}
              >
                Try Again
              </button>
              <button 
                onClick={this.handleReload}
                style={{
                  padding: "10px 20px",
                  borderRadius: 50,
                  border: "none",
                  background: "#1a6640",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer"
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

