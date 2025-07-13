// Run this script to clear cached user data and force fresh API calls
console.log('Clearing cached user data...');

// Clear user-related localStorage
localStorage.removeItem('user');
localStorage.removeItem('userProfile'); 
localStorage.removeItem('userStats');

// Keep authToken if it exists for testing
const token = localStorage.getItem('authToken');
if (token) {
  console.log('AuthToken preserved for testing');
} else {
  console.log('No authToken found');
}

console.log('Cache cleared! Reload the page to fetch fresh data from API.');
alert('Cache cleared! Reload the page to see fresh data from your backend API.');