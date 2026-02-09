/**
 * Extracts a user-friendly English error message from various error types.
 * Prioritizes backend trap messages when available.
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  // Handle string errors
  if (typeof error === 'string') return error;

  // Handle Error objects
  if (error instanceof Error) {
    // Check for backend trap messages in the error message
    const message = error.message;
    
    // Backend traps often include "Uncaught Error:" prefix
    if (message.includes('Uncaught Error:')) {
      const trapMessage = message.split('Uncaught Error:')[1]?.trim();
      if (trapMessage) return trapMessage;
    }
    
    // Return the full message if no trap pattern found
    return message;
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
  }

  // Fallback
  return 'An unexpected error occurred';
}
