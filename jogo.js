const JOGADOR_1 = 'X';
const JOGADOR_2 = 'O';

const LINHAS_VITORIA = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let modoSelecionado = null;
let tabuleiro = Array(9).fill('');
let jogoAtivo = false;
let jogadorAtual = JOGADOR_1;

$(document).ready(function(){
    $('#btn_1jog').click(function(){
        mostrarFormulario('1jog');
    });

    $('#btn_2jog').click(function(){
        mostrarFormulario('2jog');
    });

    $('#btn_voltar_1jog, #btn_voltar_2jog').click(function(evento){
        evento.preventDefault();
        mostrarEscolha();
    });

    $('#btn_play_1jog').click(function(){
        iniciarPartida('1jog');
    });

    $('#btn_play_2jog').click(function(){
        iniciarPartida('2jog');
    });

    $('.jogada').click(function(){
        jogar(Number(this.dataset.indice));
    });

    $('#btn_reiniciar').click(function(){
        $('#mensagem_box').hide();
        limparTabuleiro();
        mostrarFormulario(modoSelecionado);
    });

    mostrarEscolha();
});

function mostrarEscolha(){
    modoSelecionado = null;
    jogoAtivo = false;
    esconderMensagens();
    $('#pagina_jogo, #pagina_inicial_1jog, #pagina_inicial_2jog').hide();
    $('#imagem_inicial').show();
    $('#pagina_escolha').css('display', 'flex');
}

function mostrarFormulario(modo){
    if(!modo){
        mostrarEscolha();
        return;
    }

    modoSelecionado = modo;
    jogoAtivo = false;
    esconderMensagens();
    $('#pagina_jogo, #pagina_escolha, #pagina_inicial_1jog, #pagina_inicial_2jog').hide();
    $('#imagem_inicial, #pagina_inicial_' + modo).show();
}

function iniciarPartida(modo){
    const formulario = '#pagina_inicial_' + modo;
    const nomeJogador1 = String($(formulario + ' input[id^="inp_jogador1_"]').val()).trim();
    const nomeJogador2 = modo === '1jog'
        ? 'Computador'
        : String($(formulario + ' input[id^="inp_jogador2_"]').val()).trim();

    if(nomeJogador1 === '' || (modo === '2jog' && nomeJogador2 === '')){
        $('#mensagem_erro_' + modo).show();
        return;
    }

    modoSelecionado = modo;
    $('#nome_jogador1').text(nomeJogador1);
    $('#nome_jogador2').text(nomeJogador2);
    $('#imagem_jogador2')
        .attr('src', modo === '1jog' ? 'img/jogador3.png' : 'img/jogador2.png')
        .attr('alt', nomeJogador2);

    esconderMensagens();
    limparTabuleiro();
    jogoAtivo = true;
    $('#imagem_inicial, #pagina_escolha, #pagina_inicial_1jog, #pagina_inicial_2jog').hide();
    $('#pagina_jogo').show();
}

function jogar(indice){
    if(!jogoAtivo || !Number.isInteger(indice) || tabuleiro[indice] !== ''){
        return;
    }

    if(modoSelecionado === '1jog'){
        jogarContraComputador(indice);
        return;
    }

    if(registrarJogada(indice, jogadorAtual) && jogoAtivo){
        jogadorAtual = jogadorAtual === JOGADOR_1 ? JOGADOR_2 : JOGADOR_1;
    }
}

function jogarContraComputador(indice){
    if(jogadorAtual !== JOGADOR_1 || !registrarJogada(indice, JOGADOR_1) || !jogoAtivo){
        return;
    }

    jogadorAtual = JOGADOR_2;
    const jogadaComputador = escolherJogadaComputador(tabuleiro);

    if(jogadaComputador !== null){
        registrarJogada(jogadaComputador, JOGADOR_2);
    }

    if(jogoAtivo){
        jogadorAtual = JOGADOR_1;
    }
}

function registrarJogada(indice, jogador){
    if(!jogoAtivo || tabuleiro[indice] !== ''){
        return false;
    }

    tabuleiro[indice] = jogador;
    $('.jogada').eq(indice).css(
        'background-image',
        jogador === JOGADOR_1
            ? 'url("img/marcacao1.png")'
            : 'url("img/marcacao2.png")'
    );

    if(verificarVencedor(tabuleiro, jogador)){
        const vencedor = jogador === JOGADOR_1
            ? $('#nome_jogador1').text()
            : $('#nome_jogador2').text();
        finalizarJogo(vencedor + ' ganhou o jogo');
    } else if(casasLivres(tabuleiro).length === 0){
        finalizarJogo('Jogo empatado!');
    }

    return true;
}

function verificarVencedor(tab, jogador){
    return LINHAS_VITORIA.some(function([a, b, c]){
        return tab[a] === jogador && tab[b] === jogador && tab[c] === jogador;
    });
}

function casasLivres(tab){
    return tab.reduce(function(livres, casa, indice){
        if(casa === ''){
            livres.push(indice);
        }
        return livres;
    }, []);
}

function finalizarJogo(texto){
    jogoAtivo = false;
    $('#texto_mensagem').text(texto);
    $('#mensagem_box').fadeIn();
}

function limparTabuleiro(){
    tabuleiro = Array(9).fill('');
    jogadorAtual = JOGADOR_1;
    $('.jogada').css('background-image', '');
}

function esconderMensagens(){
    $('.mensagem-erro, #mensagem_box').hide();
}

function escolherJogadaComputador(tab){
    const analise = analisarTabuleiro(tab);

    if(analise.vitoriasComputador.length > 0){
        return sortear(analise.vitoriasComputador);
    }

    const forquilhas = encontrarForquilhasSeguras(tab);
    if(forquilhas.length > 0){
        return sortear(forquilhas);
    }

    if(analise.bloqueios.length > 0){
        return sortear(analise.bloqueios);
    }

    const livres = casasLivres(tab);
    const jogadasSeguras = encontrarJogadasSegurasContraForquilha(tab);
    if(jogadasSeguras.length < livres.length && jogadasSeguras.length > 0){
        return sortear(jogadasSeguras);
    }

    if(tab[4] === ''){
        return 4;
    }

    const cantos = [0, 2, 6, 8].filter(function(indice){ return tab[indice] === ''; });
    if(cantos.length > 0){
        return sortear(cantos);
    }

    return sortear([1, 3, 5, 7].filter(function(indice){ return tab[indice] === ''; }));
}

function analisarTabuleiro(tab){
    const vitoriasComputador = [];
    const bloqueios = [];

    LINHAS_VITORIA.forEach(function([a, b, c]){
        const valores = [tab[a], tab[b], tab[c]];
        const indices = [a, b, c];
        const casasComputador = valores.filter(function(valor){ return valor === JOGADOR_2; }).length;
        const casasHumano = valores.filter(function(valor){ return valor === JOGADOR_1; }).length;

        if(casasComputador === 2 && valores.filter(function(valor){ return valor === ''; }).length === 1){
            vitoriasComputador.push(indices[valores.indexOf('')]);
        }

        if(casasHumano === 2 && valores.filter(function(valor){ return valor === ''; }).length === 1){
            bloqueios.push(indices[valores.indexOf('')]);
        }
    });

    return {
        vitoriasComputador: [...new Set(vitoriasComputador)],
        bloqueios: [...new Set(bloqueios)]
    };
}

function sortear(candidatos){
    if(candidatos.length === 0){
        return null;
    }
    return candidatos[Math.floor(Math.random() * candidatos.length)];
}

function encontrarForquilhasSeguras(tab){
    return casasLivres(tab).filter(function(indice){
        const simulacao = simularJogada(tab, indice, JOGADOR_2);
        return vitoriasImediatas(simulacao, JOGADOR_1).length === 0 &&
            vitoriasImediatas(simulacao, JOGADOR_2).length >= 2;
    });
}

function encontrarJogadasSegurasContraForquilha(tab){
    return casasLivres(tab).filter(function(indice){
        return !criaForquilhaPerigosa(simularJogada(tab, indice, JOGADOR_2));
    });
}

function vitoriasImediatas(tab, jogador){
    return casasLivres(tab).filter(function(indice){
        return verificarVencedor(simularJogada(tab, indice, jogador), jogador);
    });
}

function simularJogada(tab, indice, jogador){
    const simulacao = tab.slice();
    simulacao[indice] = jogador;
    return simulacao;
}

function criaForquilhaPerigosa(tab){
    return casasLivres(tab).some(function(indice){
        const respostaHumana = simularJogada(tab, indice, JOGADOR_1);
        const vitoriasHumanas = vitoriasImediatas(respostaHumana, JOGADOR_1);
        const vitoriasComputador = vitoriasImediatas(respostaHumana, JOGADOR_2);
        return vitoriasHumanas.length >= 2 && vitoriasComputador.length === 0;
    });
}
