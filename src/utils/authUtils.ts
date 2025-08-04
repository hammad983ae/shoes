// Utility function to check if this is the first product view by an unsigned user
export const isFirstProductView = (isSignedIn: boolean): boolean => {
  return !isSignedIn && !localStorage.getItem("hasSeenSignupPrompt");
};

// Utility function to mark that the user has seen the signup prompt
export const markSignupPromptSeen = (): void => {
  localStorage.setItem("hasSeenSignupPrompt", "true");
}; 