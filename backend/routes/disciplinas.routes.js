const express = require("express");
const router = express.Router();
const { disciplinas, getProximoId } = require("../data/disciplinas.data.js");


router.get("/", (req, res) => {
  res.json(disciplinas);
});

// puxar a cadeira selecionada pelo id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const disciplina = disciplinas.find((d) => d.id === id);

  if (!disciplina) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  res.json(disciplina);
});

// criar a cadeira nova
router.post("/", (req, res) => {
  const { nome, semestre } = req.body || {};

  if (!nome) {
    return res.status(400).json({ erro: "O campo nome é obrigatório" });
  }

  const nova = {
    id: getProximoId(),
    nome,
    semestre: semestre ? Number(semestre) : undefined
  };

  disciplinas.push(nova);
  res.status(201).json(nova);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const indice = disciplinas.findIndex((d) => d.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  const dados = req.body || {};

  if (!dados.nome) {
    return res.status(400).json({ erro: "O campo nome é obrigatório" });
  }

  const atualizada = { ...dados, id };
  disciplinas[indice] = atualizada;
  res.json(atualizada);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const indice = disciplinas.findIndex((d) => d.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: "Disciplina não encontrada" });
  }

  disciplinas.splice(indice, 1);
  res.status(204).end();
});

module.exports = router;