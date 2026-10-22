import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#18261B] p-4 text-[#F5F0E4]">
          <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-md shadow-2xl">
            <h1 className="font-heading text-xl text-[#F5F0E4]">Something went wrong</h1>
            <p className="mt-2 text-sm text-[#C5D1BD]">
              {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
            </p>
            <button
              onClick={this.handleReload}
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#263D2B] px-5 py-2.5 text-sm font-medium text-[#F5F0E4] border border-[#C5D1BD]/40 shadow hover:bg-[#344F3A] transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
