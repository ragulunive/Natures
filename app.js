const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const cookieParser = require('cookie-parser');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

// SECURITY HTTP HEADERS
// app.use(helmet());
// SECURITY HTTP HEADERS
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      scriptSrc: [
        "'self'",
        'https://api.mapbox.com',
        'https://cdnjs.cloudflare.com',
        'https://js.stripe.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://api.mapbox.com',
        'https://fonts.googleapis.com',
      ],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      connectSrc: [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        "'self'",
        'https://api.mapbox.com',
        'https://events.mapbox.com',
        'https://cdnjs.cloudflare.com',
        'https://js.stripe.com',
      ],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://api.mapbox.com'],
      fontSrc: [
        "'self'",
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://js.stripe.com',
      ],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: ["'none'"],
      // childSrc: ["'self'"],
    },
  })
);

// DEVELOPMENT LOGIN
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUEST FROM SAME IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in an hour',
});

app.use('/api', limiter);

// BODY PARSER, READING DATA FROM THE BODY INTO req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// DATA SANITIZATION AGAINST NoSQL query injection
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'maxGroupSize',
      'price',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
    ],
  })
);

// TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on the server`);
  // err.statusCode = 400;
  // err.status = 'fail';
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
