import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Keeps one broken tool from white-screening the whole site. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown): void {
    console.error('Tool crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card p-10 text-center">
          <p className="text-3xl">😕</p>
          <h2 className="mt-2 text-lg font-bold">Something went wrong in this tool</h2>
          <p className="mt-1 text-sm text-zinc-500">Your files are safe — nothing was uploaded anywhere.</p>
          <div className="mt-5 flex justify-center gap-2">
            <button className="btn-primary" onClick={() => this.setState({ hasError: false })}>Try again</button>
            <button className="btn-secondary" onClick={() => window.location.assign('/')}>Back to all tools</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
