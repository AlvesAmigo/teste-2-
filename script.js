document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a Ficha de Personagem e o Tabletop
    gerarCamposPericias();
    adicionarCamposHabilidade(4); // Máximo de 4 habilidades
    initializeTabletop();
});

// ######################## LÓGICA DE ABAS ########################
function openTab(evt, tabName) {
    // Declara todas as variáveis
    var i, tabcontent, tablinks;

    // Pega todos os elementos com class="tab-content" e os esconde
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove('active');
    }

    // Pega todos os elementos com class="tab-button" e remove a classe "active"
    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove('active');
    }

    // Mostra a aba atual, e adiciona uma classe "active" ao botão que abriu a aba
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}


// ######################## CALCULADORA DE ROLAGEM D6 ########################
function rolarDados() {
    const numDados = parseInt(document.getElementById('numDados').value) || 0;
    const dificuldade = parseInt(document.getElementById('dificuldade').value) || 0;
    const resultadoDiv = document.getElementById('resultado');

    if (numDados < 1 || dificuldade < 1) {
        resultadoDiv.innerHTML = '<p class="falha">Valores de Dados e Dificuldade devem ser no mínimo 1.</p>';
        return;
    }

    let totalAcertos = 0;
    const rolagens = [];

    for (let i = 0; i < numDados; i++) {
        const resultadoDado = Math.floor(Math.random() * 6) + 1;
        let acertosDado = 0;
        let tipoResultado = '';

        // Regra INFLUXO: 1-3 (0 Acerto), 4-5 (1 Acerto), 6 (2 Acertos)
        if (resultadoDado >= 1 && resultadoDado <= 3) {
            acertosDado = 0;
            tipoResultado = 'ERRO';
        } else if (resultadoDado === 4 || resultadoDado === 5) {
            acertosDado = 1;
            tipoResultado = 'ACERTO';
        } else if (resultadoDado === 6) {
            acertosDado = 2;
            tipoResultado = 'ACERTO DUPLO';
        }

        totalAcertos += acertosDado;
        rolagens.push(`[${resultadoDado} -> ${tipoResultado}]`);
    }

    // Determina o Sucesso/Falha
    let mensagemFinal = '';
    let classeResultado = '';

    if (totalAcertos >= dificuldade) {
        const excesso = totalAcertos - dificuldade;
        mensagemFinal = `<span class="acerto">SUCESSO!</span> Total de **${totalAcertos}** acertos (C: ${dificuldade}).`;
        if (excesso > 0) {
            mensagemFinal += `<br>CONSEQUÊNCIA Ampliada! Sobraram **${excesso}** acertos!`;
        }
        classeResultado = 'acerto';
    } else {
        mensagemFinal = `<span class="falha">FALHA.</span> Total de **${totalAcertos}** acertos (C: ${dificuldade}).`;
        classeResultado = 'falha';
    }

    let htmlResultado = `
        <p class="${classeResultado}">${mensagemFinal}</p>
        <p>Rolagens Detalhadas: ${rolagens.join(' ')}</p>
    `;

    resultadoDiv.innerHTML = htmlResultado;
}


// ######################## CRIAÇÃO DE FICHA ########################

const CLASSES_STATS = {
    'Combatente': { vida: 'ALTA (Foco em Vigor)', ph: 'MÉDIO', descricao: 'Amplia capacidade física e manipula o Fluxo em formas sólidas (Ex: Martelo).' },
    'Especialista': { vida: 'MÉDIA', ph: 'MÉDIO', descricao: 'Usa runas em superfícies para acelerar o uso de Fluxo. Estrategista nato.' },
    'Evocador': { vida: 'MÉDIA', ph: 'MÉDIO', descricao: 'Combina manipulação de Fluxo com pactos com Entidades Místicas.' },
    'Manipulador': { vida: 'BAIXA (Frágil)', ph: 'ALTA (Foco em Ímpeto)', descricao: 'Altera a natureza (água, fogo) ou conceitos (verdade, mentira), com custo (nerf).' },
    'N/A': { vida: 'MUITO BAIXA', ph: 'ZERO', descricao: 'Pessoa comum, sem capacidade de usar Fluxo.' }
};

function atualizarAtributosBase() {
    const classe = document.getElementById('pClasse').value;
    const stats = CLASSES_STATS[classe];
    const statsDiv = document.getElementById('statsBase');

    statsDiv.innerHTML = `
        <p><strong>Vida Base:</strong> ${stats.vida}</p>
        <p><strong>PH Base:</strong> ${stats.ph}</p>
        <p class="dica"><em>Detalhes da Classe: ${stats.descricao}</em></p>
    `;
}

// Geração de campos de perícias dinamicamente
function gerarCamposPericias() {
    const container = document.getElementById('pericias-container');
    container.innerHTML = '';
    
    // PERICIAS está vindo do pericias.js
    PERICIAS.forEach(pericia => {
        const div = document.createElement('div');
        div.classList.add('pericia-item');
        div.innerHTML = `
            <span>${pericia.nome} (${pericia.atributo}):</span>
            <input type="number" id="pericia-${pericia.nome.replace(/\s/g, '')}" value="0" min="0">
        `;
        container.appendChild(div);
    });
}

// Geração de campos de habilidade
function adicionarCamposHabilidade(numero) {
    const container = document.getElementById('habilidades-container');
    container.innerHTML = '';

    for (let i = 1; i <= numero; i++) {
        const fieldset = document.createElement('fieldset');
        fieldset.innerHTML = `
            <legend>Habilidade ${i}</legend>
            <div class="input-group">
                <label>Nome:</label><input type="text" id="hNome${i}">
                <label>Custo (PH):</label><input type="number" id="hCusto${i}" value="0" min="0">
            </div>
            <label>Efeito/Descrição:</label>
            <textarea id="hEfeito${i}" rows="2"></textarea>
        `;
        container.appendChild(fieldset);
    }
}


function gerarFichaJSON() {
    const ficha = {
        Sistema: "INFLUXO",
        DadosPessoais: {
            Nome: document.getElementById('pNome').value,
            Idade: parseInt(document.getElementById('pIdade').value) || 'N/A',
            Altura: parseInt(document.getElementById('pAltura').value) || 'N/A',
            CaracteristicasGerais: document.getElementById('pCaracteristicas').value
        },
        Nivel: document.getElementById('pNivel').value,
        Classe: document.getElementById('pClasse').value,
        EstatisticasBase: CLASSES_STATS[document.getElementById('pClasse').value],
        Atributos: {
            Vigor: parseInt(document.getElementById('aVigor').value) || 0,
            Impulso: parseInt(document.getElementById('aImpulso').value) || 0,
            Presenca: parseInt(document.getElementById('aPresenca').value) || 0
        },
        Habilidades: [],
        Pericias: {}
    };

    // Preenche Habilidades
    for (let i = 1; i <= 4; i++) {
        const nome = document.getElementById(`hNome${i}`).value;
        if (nome) {
            ficha.Habilidades.push({
                Nome: nome,
                CustoPH: parseInt(document.getElementById(`hCusto${i}`).value) || 0,
                Efeito: document.getElementById(`hEfeito${i}`).value
            });
        }
    }

    // Preenche Perícias
    PERICIAS.forEach(pericia => {
        const valor = parseInt(document.getElementById(`pericia-${pericia.nome.replace(/\s/g, '')}`).value) || 0;
        ficha.Pericias[pericia.nome] = valor;
    });

    // Exibe o JSON formatado
    document.getElementById('fichaOutput').value = JSON.stringify(ficha, null, 4);
    alert("Ficha Gerada com Sucesso! Copie o JSON na caixa de texto abaixo.");
}


// ######################## TABLETOP SIMPLES ########################
let tokenCount = 0;

function initializeTabletop() {
    const board = document.getElementById('game-board');
    // Cria 100 células para o visual do grid (10x10)
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.classList.add('board-cell');
        board.appendChild(cell);
    }
}

function adicionarPersonagem() {
    tokenCount++;
    const board = document.getElementById('game-board');
    const token = document.createElement('div');
    token.classList.add('token');
    token.id = `token-${tokenCount}`;
    token.innerHTML = `P${tokenCount}`;

    // Posicionamento inicial aleatório
    const startX = Math.random() * 80 + 10; 
    const startY = Math.random() * 80 + 10; 
    token.style.left = `${startX}%`;
    token.style.top = `${startY}%`;

    board.appendChild(token);

    // Adiciona funcionalidade de arrastar e soltar
    makeDraggable(token);
}

function limparTabletop() {
    const board = document.getElementById('game-board');
    // Remove todos os tokens, mantendo as células de fundo
    Array.from(board.children).filter(el => el.classList.contains('token')).forEach(token => token.remove());
    tokenCount = 0;
}

// Lógica de arrastar e soltar (Drag and Drop) para os tokens
function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // Pega a posição do mouse no início
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calcula a nova posição do cursor
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Calcula a nova posição do elemento (em relação ao parent 'game-board')
        const board = element.parentElement;
        const boardRect = board.getBoundingClientRect();
        
        let newTop = element.offsetTop - pos2;
        let newLeft = element.offsetLeft - pos1;
        
        // Limita o movimento dentro do board
        newTop = Math.max(0, Math.min(newTop, boardRect.height - element.offsetHeight));
        newLeft = Math.max(0, Math.min(newLeft, boardRect.width - element.offsetWidth));

        element.style.top = `${newTop}px`;
        element.style.left = `${newLeft}px`;
    }

    function closeDragElement() {
        // Para de mover quando o botão do mouse é solto
        document.onmouseup = null;
        document.onmousemove = null;
    }
}