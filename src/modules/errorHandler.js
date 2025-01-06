const errorHandler = (err, req, res, next) => {
    console.error('Error stack:', err.stack); // Log the error stack for debugging
    console.error('Error message:', err.message); // Log the error message for debugging
    console.error('Error status:', err.status); // Log the error status for debugging
    console.error('Request path:', req.path); // Log the request path
    console.error('Request method:', req.method); // Log the request method

    const isDevelopment = process.env.NODE_ENV === 'development';

    if (err.status === 404) {
        // Send a 404 Not Found response with more details in development mode
        if (isDevelopment) {
            res.status(404).json({
                status: 404,
                message: 'Not Found',
                error: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method
            });
        } else {
            res.status(404).send('Not Found');
        }
    } else {
        // Handle other errors (e.g., 500 Internal Server Error)
        if (isDevelopment) {
            res.status(500).json({
                status: 500,
                message: 'Internal Server Error',
                error: err.message,
                stack: err.stack,
                path: req.path,
                method: req.method
            });
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
};

// Middleware to handle 404 errors
const handle404 = (req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
};

// Combine both middlewares into one function
const combinedErrorHandler = (req, res, next) => {
    handle404(req, res, (err) => {
        if (err) {
            errorHandler(err, req, res, next);
        } else {
            next();
        }
    });
};

module.exports = combinedErrorHandler;