const express = require("express");
const router = express.Router();
const { perfil } = require("../data/alunos.data.js");

// puxar meu perfil
router.get("/", (req, res) => {
  res.json(perfil);
});

module.exports = router;