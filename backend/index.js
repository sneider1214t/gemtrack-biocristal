const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend de Biocristal funcionando correctamente ✅');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});