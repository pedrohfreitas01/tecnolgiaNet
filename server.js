const express = require("express");
const path = require("path");

const app = express();
const PORTA = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

const disciplinasRouter = require("./backend/routes/disciplinas.routes.js");
const perfilRouter = require("./backend/routes/alunos.routes.js");

// rotas 
app.use("/api/disciplinas", disciplinasRouter);
app.use("/api/perfil", perfilRouter);

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});