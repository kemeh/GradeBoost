import * as React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      
      const rawMessage = this.state.error?.message || '';
      if (rawMessage.includes('dynamically imported module') || rawMessage.includes('Failed to fetch')) {
        errorMessage = 'A newer version of this page is available. Please click refresh to load the latest update.';
      } else {
        try {
          // Check if it's a Firestore error JSON string
          const parsed = JSON.parse(rawMessage);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Database error: ${parsed.error}. Operation: ${parsed.operationType}`;
          }
        } catch (e) {
          // Not a JSON error, use original message if available
          if (rawMessage) {
            errorMessage = rawMessage;
          }
        }
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-2xl border border-slate-100 text-center space-y-8">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 mx-auto">
              <AlertCircle size={40} />
            </div>
            
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Something went wrong</h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3 group"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3"
              >
                <Home size={20} />
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
