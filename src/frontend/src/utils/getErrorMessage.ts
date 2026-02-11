export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for owner-only authorization errors
    if (error.message.includes('Only the canister owner')) {
      return 'Access denied. Only the application owner can perform this action.';
    }
    if (error.message.includes('Unauthorized: Owner access only')) {
      return 'Access denied. Only the application owner can perform this action.';
    }
    if (error.message.includes('Canister has no owner set')) {
      return 'The application has not been claimed yet. Please claim ownership first.';
    }
    if (error.message.includes('already owned by another principal')) {
      return 'This application has already been claimed by another owner.';
    }
    
    // Check for other authorization errors
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
