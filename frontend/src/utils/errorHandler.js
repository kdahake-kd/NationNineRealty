/**
 * Centralized Error Handling Utilities
 */
export class AppError extends Error {
  constructor(message, code, statusCode = 500, details = {}) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response
    return {
      message: data?.error || data?.message || 'An error occurred',
      code: data?.code || `HTTP_${status}`,
      statusCode: status,
      details: data
    }
  } else if (error.request) {
    // Request made but no response received
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      statusCode: 0,
      details: { originalError: error.message }
    }
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      details: { originalError: error.toString() }
    }
  }
}

export const logError = (error, context = {}) => {
  const errorInfo = {
    message: error.message || 'Unknown error',
    code: error.code || 'UNKNOWN',
    statusCode: error.statusCode || 500,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack
  }
  
  console.error('Error occurred:', errorInfo)
  return errorInfo
}

export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error
  }
  
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  
  if (error.message) {
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

