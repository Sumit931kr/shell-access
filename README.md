# shell-access

`shell-access` is an npm library that provides server access through a web browser.

## Installation

To install `shell-access`, use npm:

```javascript 
npm install shell-access
```

## Prerequisites

- Express server
- http-proxy-middleware

Make sure to install `http-proxy-middleware` in your server:
by using

```javascript 
npm install http-proxy-middleware
```

## Usage

1. Initialize the shell-access in your server code:

```javascript
const initialization = require('shell-access');

// <!-- pass the passcode in function -->
initialization("passcode");
```

2. Set up the proxy middleware in your Express server:

```javascript 
const { createProxyMiddleware } = require('http-proxy-middleware');

// Proxy for the shell-access service
app.use('/shell-access', createProxyMiddleware({
  target: 'http://localhost:8765',
  ws: true,
  changeOrigin: true,
}));
```


## Usage

Here’s a basic example of how to integrate shell-access with an Express server:

```javascript
const express = require('express');
const initialization = require('shell-access');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Initialize shell-access
// <!-- pass the passcode in function -->
initialization("passcode");


// Set up proxy middleware
app.use('/shell-access', createProxyMiddleware({
  target: 'http://localhost:8765',
  ws: true,
  changeOrigin: true,
}));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

```
now go to `http://localhost:3000/shell-access` to access your shell.

## How It Works

- The `initialization()` function sets up the necessary configuration for shell access.
- The `createProxyMiddleware` function proxies requests from the client to the server, enabling real-time communication.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to report bugs or request features.

## License

This project is licensed under the MIT License

## Support

If you encounter any issues, feel free to open an issue on GitHub or contact me directly.

