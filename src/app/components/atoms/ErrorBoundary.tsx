import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="h-full bg-[#0E0E0E] flex items-center justify-center p-5">
          <div className="bg-[#171717] rounded-[30px] p-8 max-w-sm w-full border border-[#2C2C2C] text-center">
            <AlertTriangle className="w-12 h-12 text-[#FF4D67] mx-auto mb-4" />
            <h2 className="text-[18px] font-semibold text-white mb-2">Algo salió mal</h2>
            <p className="text-[13px] text-[#6E6E6E] mb-6">
              Ocurrió un error inesperado. Puedes intentar de nuevo.
            </p>
            {this.state.error && (
              <p className="text-[11px] text-[#FF4D67] mb-4 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            {this.state.error?.stack && (
              <details className="text-left">
                <summary className="text-[11px] text-[#6E6E6E] cursor-pointer">Stack</summary>
                <pre className="text-[10px] text-[#6E6E6E] mt-2 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleRetry}
              className="h-12 px-6 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] inline-flex items-center gap-2 shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
