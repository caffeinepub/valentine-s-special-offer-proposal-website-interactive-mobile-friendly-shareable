export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check if it's a backend trap message
    if (error.message.includes('Unauthorized')) {
      return 'You do not have permission to perform this action.';
    }
    if (error.message.includes('Insufficient balance')) {
      return 'Insufficient balance for this transaction.';
    }
    if (error.message.includes('not found')) {
      return 'The requested resource was not found.';
    }
    if (error.message.includes('already completed')) {
      return 'This transaction has already been completed.';
    }
    if (error.message.includes('Invalid status')) {
      return 'Invalid transaction status.';
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}
