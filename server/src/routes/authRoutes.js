const express = require('express');
const router = express.Router();

// Login simple (implementar lógica real después)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // TODO: Implementar autenticación real
  if (username === 'admin' && password === 'admin') {
    res.json({ 
      token: 'fake-jwt-token',
      user: { username, role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

module.exports = router;