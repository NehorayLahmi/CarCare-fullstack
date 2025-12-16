require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./db');

const authRoutes = require('./routers/auth');
const profileRoutes = require('./routers/profile');
const vehicleRoutes = require('./routers/vehicles');
const serviceRoutes = require('./routers/services');
const transferRouter = require('./routers/transfer');
const modelService = require('./routers/modelService');

const app = express();
const PORT = process.env.PORT || 4000;
const URL = process.env.URL;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

connectDB();
app.get('/auth/test', (req, res) => {
  res.send('🔥 השרת עובד');
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/services', serviceRoutes);
app.use('/transfer', transferRouter);
app.use('/modelService', modelService);


app.use((req, res) => {
  res.status(404).send('לא נמצא');
});
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url} from ${req.ip}`);
  next();
});


// app.listen(PORT, () => {
//   console.log(`✅ Server is running at http://localhost:${PORT}`);
// });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running at ${URL}:${PORT}`);
});
