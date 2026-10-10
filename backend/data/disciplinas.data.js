let disciplinas = [
  { id: 1, nome: "Tecnologias de Internet", semestre: 4 },
  { id: 2, nome: "Sistema de Banco de Dados", semestre: 5 },
  { id: 3, nome: "Engenharia de Software II", semestre: 6 },
  { id: 4, nome: "Computacao Grafica", semestre: 6 }
];

let proximoId = 5;

module.exports = {
  disciplinas,
  getProximoId: () => proximoId++,
};