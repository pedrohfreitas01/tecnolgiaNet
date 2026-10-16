async function carregarPerfil() {
  try {
    const res = await fetch("/api/perfil");
    if (!res.ok) {
      throw new Error(`Falha ao carregar perfil (HTTP ${res.status})`);
    }

    const perfil = await res.json();
    document.getElementById("perfil-foto").src = perfil.foto;
    document.getElementById("perfil-nome").textContent = perfil.nome;
    document.getElementById("perfil-curso").textContent = perfil.curso;
    document.getElementById("perfil-semestre").textContent = perfil.semestre;
    document.getElementById("perfil-descricao").textContent = perfil.descricao;
  } catch (err) {
    console.error("Erro ao carregar perfil:", err);
  }
}

function definirFeedbackDisciplinas(mensagem, tipo = "") {
  const feedback = document.getElementById("disciplinas-feedback");
  feedback.textContent = mensagem;
  feedback.className = `feedback-msg ${tipo}`.trim();
}

function criarElemento(tag, classe = "", texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function criarBotao(texto, classe, tipo = "button") {
  const botao = criarElemento("button", classe, texto);
  botao.type = tipo;
  return botao;
}

function criarCampoDisciplina(id, rotulo, tipo, valor) {
  const grupo = criarElemento("div", "form-group");
  const label = criarElemento("label", "", rotulo);
  const input = document.createElement("input");

  label.htmlFor = id;
  input.id = id;
  input.type = tipo;
  input.value = valor || "";
  if (tipo === "text") input.required = true;
  if (tipo === "number") {
    input.min = "1";
    input.max = "10";
  }

  grupo.append(label, input);
  return { grupo, input };
}

async function mensagemErro(res, mensagemPadrao) {
  try {
    const resultado = await res.json();
    return resultado.erro || mensagemPadrao;
  } catch {
    return mensagemPadrao;
  }
}

async function requisicaoApi(url, opcoes = {}, mensagemPadrao) {
  const res = await fetch(url, opcoes);
  if (!res.ok) {
    throw new Error(await mensagemErro(res, `${mensagemPadrao} (HTTP ${res.status})`));
  }
  return res.status === 204 ? null : res.json();
}

async function carregarDetalhesDisciplina(id, detalhes, botao) {
  try {
    const disciplina = await requisicaoApi(
      `/api/disciplinas/${id}`,
      {},
      "Falha ao carregar disciplina"
    );
    const semestre = disciplina.semestre
      ? `${disciplina.semestre}º semestre`
      : "Sem semestre";
    detalhes.replaceChildren();

    [["ID", disciplina.id], ["Semestre", semestre]].forEach(([rotulo, valor]) => {
      const linha = criarElemento("p");
      const nomeCampo = criarElemento("strong", "", `${rotulo}: `);
      linha.append(nomeCampo, document.createTextNode(valor));
      detalhes.appendChild(linha);
    });

    detalhes.hidden = false;
    botao.setAttribute("aria-expanded", "true");
  } catch (err) {
    detalhes.textContent = err.message || "Não foi possível carregar a disciplina.";
    detalhes.hidden = false;
    botao.setAttribute("aria-expanded", "false");
  }
}

async function salvarDisciplina(event, disciplina, formulario, inputNome, inputSemestre) {
  event.preventDefault();
  const nome = inputNome.value.trim();
  inputNome.setCustomValidity(nome ? "" : "Informe o nome da disciplina.");
  if (!formulario.reportValidity()) return;

  const dados = { nome };
  if (inputSemestre.value !== "") {
    dados.semestre = Number(inputSemestre.value);
  }

  try {
    await requisicaoApi(`/api/disciplinas/${disciplina.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    }, "Falha ao atualizar disciplina");

    await carregarDisciplinas();
    definirFeedbackDisciplinas("Disciplina atualizada com sucesso.", "feedback-success");
  } catch (err) {
    definirFeedbackDisciplinas(err.message || "Não foi possível atualizar a disciplina.", "feedback-error");
  }
}

async function excluirDisciplina(disciplina) {
  if (!window.confirm(`Excluir a disciplina "${disciplina.nome}"?`)) return;

  try {
    await requisicaoApi(`/api/disciplinas/${disciplina.id}`, { method: "DELETE" }, "Falha ao excluir disciplina");
    await carregarDisciplinas();
    definirFeedbackDisciplinas("Disciplina excluída com sucesso.", "feedback-success");
  } catch (err) {
    definirFeedbackDisciplinas(err.message || "Não foi possível excluir a disciplina.", "feedback-error");
  }
}

function criarItemDisciplina(disciplina) {
  const item = criarElemento("li", "disciplina-item");
  const linha = criarElemento("div", "disciplina-row");
  const info = criarElemento("div", "disciplina-info");
  const icon = criarElemento("span", "disciplina-icon", "📘");
  const nome = criarBotao(disciplina.nome, "disciplina-title");
  const acoes = criarElemento("div", "disciplina-actions");
  const editar = criarBotao("Editar", "btn-secondary btn-small");
  const excluir = criarBotao("Delete", "btn-danger btn-small");
  const detalhes = criarElemento("div", "disciplina-details");
  const formulario = criarElemento("form", "disciplina-edit-form");
  const campoNome = criarCampoDisciplina(
    `disciplina-nome-${disciplina.id}`,
    "Nome",
    "text",
    disciplina.nome
  );
  const campoSemestre = criarCampoDisciplina(
    `disciplina-semestre-${disciplina.id}`,
    "Semestre",
    "number",
    disciplina.semestre
  );
  const salvar = criarBotao("Salvar", "btn-primary btn-small", "submit");
  const cancelar = criarBotao("Cancelar", "btn-secondary btn-small");

  nome.setAttribute("aria-expanded", "false");
  nome.setAttribute("aria-controls", `disciplina-detalhes-${disciplina.id}`);
  detalhes.id = `disciplina-detalhes-${disciplina.id}`;
  detalhes.hidden = true;
  formulario.hidden = true;
  formulario.append(campoNome.grupo, campoSemestre.grupo, salvar, cancelar);
  info.append(icon, nome);
  acoes.append(editar, excluir);
  linha.append(info, acoes);
  item.append(linha, detalhes, formulario);

  nome.addEventListener("click", () => {
    if (!detalhes.hidden) {
      detalhes.hidden = true;
      nome.setAttribute("aria-expanded", "false");
      return;
    }
    carregarDetalhesDisciplina(disciplina.id, detalhes, nome);
  });

  editar.addEventListener("click", () => {
    formulario.hidden = !formulario.hidden;
    detalhes.hidden = true;
    nome.setAttribute("aria-expanded", "false");
    if (!formulario.hidden) campoNome.input.focus();
  });
  cancelar.addEventListener("click", () => {
    formulario.hidden = true;
  });
  formulario.addEventListener("submit", (event) => {
    salvarDisciplina(event, disciplina, formulario, campoNome.input, campoSemestre.input);
  });
  excluir.addEventListener("click", () => excluirDisciplina(disciplina));

  return item;
}

//  GET carregar a lista do Backend e mostrar todas elas no front 
async function carregarDisciplinas() {
  const lista = document.getElementById("lista-disciplinas");
  const contador = document.getElementById("disciplinas-count");

  try {
    const disciplinas = await requisicaoApi("/api/disciplinas", {}, "Falha ao carregar disciplinas");
    if (!Array.isArray(disciplinas)) {
      throw new Error("A resposta da API de disciplinas não é uma lista");
    }

    lista.replaceChildren();
    contador.textContent = disciplinas.length;

    if (disciplinas.length === 0) {
      lista.appendChild(criarElemento("li", "", "Nenhuma disciplina cadastrada."));
      return;
    }

    lista.append(...disciplinas.map(criarItemDisciplina));
  } catch (err) {
    console.error("Erro ao carregar disciplinas:", err);
    contador.textContent = "0";
    lista.replaceChildren();
    definirFeedbackDisciplinas("Não foi possível carregar as disciplinas.", "feedback-error");
    lista.appendChild(criarElemento("li", "", "Nenhuma disciplina disponível."));
  }
}

// deixar o site no Darkmode ou lightmode 
function configurarTema() {
  const botao = document.getElementById("theme-toggle");

  function aplicarTema(tema) {
    const temaEscuro = tema === "dark";
    document.documentElement.dataset.theme = temaEscuro ? "dark" : "light";
    botao.textContent = temaEscuro ? "☀️" : "🌙";
    botao.title = temaEscuro ? "Ativar tema claro" : "Ativar tema escuro";
    botao.setAttribute("aria-label", botao.title);
    botao.setAttribute("aria-pressed", String(temaEscuro));
    localStorage.setItem("tema", temaEscuro ? "dark" : "light");
  }

  aplicarTema(localStorage.getItem("tema") === "dark" ? "dark" : "light");
  botao.addEventListener("click", () => {
    const temaAtual = document.documentElement.dataset.theme;
    aplicarTema(temaAtual === "dark" ? "light" : "dark");
  });
}

function configurarFormularioDisciplina() {
  const formulario = document.getElementById("form-disciplina");
  const feedback = document.getElementById("form-feedback");

  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    feedback.className = "feedback-msg";

    const nome = document.getElementById("disc-nome").value.trim();
    const semestre = Number(document.getElementById("disc-semestre").value);

    try {
      await requisicaoApi("/api/disciplinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, semestre }),
      }, "Falha ao cadastrar disciplina");

      formulario.reset();
      feedback.textContent = "Disciplina cadastrada com sucesso.";
      feedback.classList.add("feedback-success");
      await carregarDisciplinas();
    } catch (err) {
      console.error("Erro ao cadastrar disciplina:", err);
      feedback.textContent = err.message || "Não foi possível cadastrar a disciplina.";
      feedback.classList.add("feedback-error");
    }
  });
}

configurarTema();
configurarFormularioDisciplina();
carregarPerfil();
carregarDisciplinas();
