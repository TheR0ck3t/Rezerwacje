const errorHandler = (err, req, res, next) => {
    console.error('Error stack:', err.stack); // Logowanie stosu błędu do debugowania
    console.error('Error message:', err.message); // Logowanie komunikatu błędu do debugowania
    console.error('Error status:', err.status); // Logowanie statusu błędu do debugowania
    console.error('Request path:', req.path); // Logowanie ścieżki żądania
    console.error('Request method:', req.method); // Logowanie metody żądania

    const isDevelopment = process.env.NODE_ENV === 'development';

    if (err.status === 404) {
        // Wysyłanie odpowiedzi 404 Not Found z większą ilością szczegółów w trybie deweloperskim
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
            res.status(404).render('public/errors/404', {
                message: 'Nie znaleziono strony',
                error: err.message,
                path: req.path,
                method: req.method
            });
        }
    } else {
        // Obsługa innych błędów (np. 500 Internal Server Error)
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

// Middleware do obsługi błędów 404
const handle404 = (req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
};

// Połączenie obu middleware'ów w jedną funkcję
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