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

async function carregarDisciplinas() {
  const lista = document.getElementById("lista-disciplinas");
  const contador = document.getElementById("disciplinas-count");

  try {
    const res = await fetch("/api/disciplinas");
    if (!res.ok) {
      throw new Error(`Falha ao carregar disciplinas (HTTP ${res.status})`);
    }

    const disciplinas = await res.json();
    if (!Array.isArray(disciplinas)) {
      throw new Error("A resposta da API de disciplinas não é uma lista");
    }

    lista.replaceChildren();
    contador.textContent = disciplinas.length;

    if (disciplinas.length === 0) {
      const item = document.createElement("li");
      item.textContent = "Nenhuma disciplina cadastrada.";
      lista.appendChild(item);
      return;
    }

    disciplinas.forEach((disciplina) => {
      const item = document.createElement("li");
      const info = document.createElement("div");
      const icon = document.createElement("span");
      const nome = document.createElement("span");
      const semestre = document.createElement("span");

      info.className = "disciplina-info";
      icon.className = "disciplina-icon";
      icon.textContent = "📘";
      nome.textContent = disciplina.nome;
      semestre.className = "disciplina-semestre";
      semestre.textContent = disciplina.semestre
        ? `${disciplina.semestre}º semestre`
        : "Sem semestre";

      info.append(icon, nome);
      item.append(info, semestre);
      lista.appendChild(item);
    });
  } catch (err) {
    console.error("Erro ao carregar disciplinas:", err);
    contador.textContent = "0";
    lista.replaceChildren();
    const item = document.createElement("li");
    item.textContent = "Não foi possível carregar as disciplinas.";
    lista.appendChild(item);
  }
}

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
      const res = await fetch("/api/disciplinas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, semestre }),
      });
      const resultado = await res.json();

      if (!res.ok) {
        throw new Error(resultado.erro || `Falha ao cadastrar (HTTP ${res.status})`);
      }

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
