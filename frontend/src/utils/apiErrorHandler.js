/**
 * API Error Handler - Wraps API calls with error handling
 */
import { handleAPIError, formatErrorMessage } from './errorHandler'

export const withErrorHandling = async (apiCall, errorCallback = null) => {
  try {
    const response = await apiCall()
    return { success: true, data: response.data, response }
  } catch (error) {
    const errorInfo = handleAPIError(error)
    
    if (errorCallback) {
      errorCallback(errorInfo)
    } else {
      console.error('API Error:', errorInfo)
    }
    
    return { success: false, error: errorInfo, message: formatErrorMessage(error) }
  }
}

export const createErrorBoundary = (Component) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="error-boundary">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </button>
          </div>
        )
      }

      return <Component {...this.props} />
    }
  }
}

