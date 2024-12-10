const express = require('express');
const helmet = require('helmet'); // Helmet helps set security-related headers
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: true
    }
  },
  referrerPolicy: {
    policy: 'no-referrer'
  },
  xContentSecurityPolicy: true,
  xFrameOptions: 'DENY',
  xssFilter: true,
  permissionsPolicy: {
    interestCohort: 'disabled',
    unsandboxedNotifications: 'none'
  }
}));

// Serve assetlinks.json
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'assetlinks.json'));
});

// Serve React app
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
