const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();

// Import all routes
const homeRoutes = require('./routes/home');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const paymentRoutes = require('./routes/payment');
const orderRoutes = require('./routes/order');

//Regular middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Temp check
app.set('view engine', 'ejs');

// Cookies and file middlewares
app.use(cookieParser());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: 'tmp/'
}));

//Swagger middleware
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Morgan middleware
app.use(morgan('tiny'))

app.use('/api/v1', homeRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', productRoutes);
app.use('/api/v1', paymentRoutes);
app.use('/api/v1', orderRoutes);

app.get('/signup', (req, res) => res.render('signup'));
app.get('/password/reset/:token', (req, res) => res.render('passwordReset', {token: req.params.token}));

// Export app js
module.exports = app;