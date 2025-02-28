// This is a test file with extremely repetitive patterns to test UTCP compression

// Repeated function definitions (identical)
function processUserData(userData) {
  const { firstName, lastName, email, preferences } = userData;
  return {
    fullName: `${firstName} ${lastName}`,
    email: email.toLowerCase(),
    displayPreferences: preferences.display || 'default',
    notificationPreferences: preferences.notifications || 'default'
  };
}

function processUserData(userData) {
  const { firstName, lastName, email, preferences } = userData;
  return {
    fullName: `${firstName} ${lastName}`,
    email: email.toLowerCase(),
    displayPreferences: preferences.display || 'default',
    notificationPreferences: preferences.notifications || 'default'
  };
}

function processUserData(userData) {
  const { firstName, lastName, email, preferences } = userData;
  return {
    fullName: `${firstName} ${lastName}`,
    email: email.toLowerCase(),
    displayPreferences: preferences.display || 'default',
    notificationPreferences: preferences.notifications || 'default'
  };
}

// Some other repetitive patterns
const configuration = {
  apiEndpoint: 'https://api.example.com/v2',
  timeout: 5000,
  retryCount: 3,
  authenticationMethod: 'OAuth2',
};

const configuration = {
  apiEndpoint: 'https://api.example.com/v2',
  timeout: 5000,
  retryCount: 3,
  authenticationMethod: 'OAuth2',
};

const commonPhraseRepeatedMultipleTimes = "This is a common phrase that will be repeated multiple times";
const commonPhraseRepeatedMultipleTimes = "This is a common phrase that will be repeated multiple times";
const commonPhraseRepeatedMultipleTimes = "This is a common phrase that will be repeated multiple times";
const commonPhraseRepeatedMultipleTimes = "This is a common phrase that will be repeated multiple times";

// Test data to process
const users = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    preferences: {
      display: 'dark',
      notifications: 'email'
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    preferences: {
      display: 'light',
      notifications: 'push'
    }
  },
  {
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    preferences: {
      display: 'default',
      notifications: 'none'
    }
  }
];

// Process all users
const processedUsers = users.map(user => processUserData(user));
console.log(processedUsers);

// And a lot more repetitive code
for (let i = 0; i < processedUsers.length; i++) {
  const user = processedUsers[i];
  console.log(`User ${i+1}: ${user.fullName} (${user.email})`);
  console.log(`Display Mode: ${user.displayPreferences}`);
  console.log(`Notifications: ${user.notificationPreferences}`);
  console.log('---');
}

for (let i = 0; i < processedUsers.length; i++) {
  const user = processedUsers[i];
  console.log(`User ${i+1}: ${user.fullName} (${user.email})`);
  console.log(`Display Mode: ${user.displayPreferences}`);
  console.log(`Notifications: ${user.notificationPreferences}`);
  console.log('---');
}
