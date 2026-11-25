import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Unexpected error occurred.',
    };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center p-6 bg-[#fefce8] text-[#143820]">
          <div className="max-w-md w-full rounded-3xl bg-white border-[4px] border-[#143820] shadow-[0_6px_0_#143820] p-6 text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Yayle Juara</h1>
            <p className="text-sm font-semibold text-emerald-900 mb-4">
              Terjadi gangguan sementara. Klik tombol di bawah untuk memuat ulang permainan dengan aman.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-11 px-6 rounded-2xl bg-emerald-600 text-white font-display font-bold border-[3px] border-[#143820] shadow-[0_3px_0_#143820] cursor-pointer"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
