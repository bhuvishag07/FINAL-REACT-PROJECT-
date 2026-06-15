import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // You could also log to an external service here
    // console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8">
            <h2 className="text-2xl font-black mb-4">Something went wrong</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4">An unexpected error occurred while rendering the app. Details below:</p>
            <pre className="text-xs bg-[var(--accent)] p-4 rounded-lg overflow-auto" style={{maxHeight: '40vh'}}>
              {this.state.error && this.state.error.toString()}
              {this.state.info && this.state.info.componentStack}
            </pre>
            <div className="mt-6 text-right">
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-xl" onClick={() => location.reload()}>Reload</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
