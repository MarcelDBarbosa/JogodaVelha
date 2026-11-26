const JOGADOR_HUMANO = 'X';
const JOGADOR_COMPUTADOR = 'O';

const LINHAS_VITORIA = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let tabuleiro = Array(9).fill('');
let jogoAtivo = true;
let jogadorAtual = JOGADOR_HUMANO;

$(document).ready(function(){
    $('#btn_play').click(iniciarJogo);
    $('.jogada').click(function(){
        jogarHumano(Number(this.dataset.indice));
    });

    $('#btn_reiniciar').click(function(){
        $('#mensagem_box').hide();
        jogoAtivo = true;
        jogadorAtual = JOGADOR_HUMANO;
        limpa();
        $('#pagina_inicial').show();
        $('#pagina_jogo').hide();
    });

    function iniciarJogo(){
        const nomeHumano = String($('#inp_jogador1').val()).trim();

        if(nomeHumano === ''){
            $('#mensagem_erro').show();
            return false;
        }

        $('#nome_jogador1').text(nomeHumano);
        $('#nome_jogador2').text($('#inp_jogador2').text());

        jogoAtivo = true;
        jogadorAtual = JOGADOR_HUMANO;
        limpa();
        $('#mensagem_erro').hide();
        $('#pagina_inicial').hide();
        $('#pagina_jogo').show();
    }

    function jogarHumano(indice){
        if(!jogoAtivo || jogadorAtual !== JOGADOR_HUMANO){
            return;
        }

        if(!registrarJogada(indice, JOGADOR_HUMANO)){
            return;
        }

        if(!jogoAtivo){
            return;
        }

        jogadorAtual = JOGADOR_COMPUTADOR;
        jogarComputador();

        if(jogoAtivo){
            jogadorAtual = JOGADOR_HUMANO;
        }
    }

    function registrarJogada(indice, jogador){
        if(!jogoAtivo || !Number.isInteger(indice) || indice < 0 || indice > 8){
            return false;
        }

        if(tabuleiro[indice] !== ''){
            return false;
        }

        tabuleiro[indice] = jogador;
        $('.jogada').eq(indice).css(
            'background-image',
            jogador === JOGADOR_HUMANO
                ? 'url("img/marcacao1.png")'
                : 'url("img/marcacao2.png")'
        );

        if(verificarVencedor(tabuleiro, jogador)){
            const nome = jogador === JOGADOR_HUMANO
                ? $('#nome_jogador1').text()
                : $('#nome_jogador2').text();
            finalizarJogo(nome + ' ganhou o jogo');
        } else if(casasLivres(tabuleiro).length === 0){
            finalizarJogo('Jogo empatado!');
        }

        return true;
    }

    function verificarVencedor(tab, jogador){
        return LINHAS_VITORIA.some(([a, b, c]) =>
            tab[a] === jogador &&
            tab[b] === jogador &&
            tab[c] === jogador
        );
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

    function jogarComputador(){
        const indice = escolherJogadaComputador(tabuleiro);

        if(indice !== null){
            registrarJogada(indice, JOGADOR_COMPUTADOR);
        }
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

        const casasLivresAtuais = casasLivres(tab);
        const jogadasSeguras = encontrarJogadasSegurasContraForquilha(tab);
        const existemJogadasPerigosas = jogadasSeguras.length < casasLivresAtuais.length;

        if(existemJogadasPerigosas && jogadasSeguras.length > 0){
            return sortear(jogadasSeguras);
        }

        if(tab[4] === ''){
            return 4;
        }

        const cantosLivres = [0, 2, 6, 8].filter(indice => tab[indice] === '');
        if(cantosLivres.length > 0){
            return sortear(cantosLivres);
        }

        return sortear([1, 3, 5, 7].filter(indice => tab[indice] === ''));
    }

    function analisarTabuleiro(tab){
        const vitoriasComputador = [];
        const bloqueios = [];

        LINHAS_VITORIA.forEach(function([a, b, c]){
            const valores = [tab[a], tab[b], tab[c]];
            const indices = [a, b, c];
            const casasComputador = valores.filter(valor => valor === JOGADOR_COMPUTADOR).length;
            const casasHumano = valores.filter(valor => valor === JOGADOR_HUMANO).length;
            const casasVazias = valores.filter(valor => valor === '').length;

            if(casasComputador === 2 && casasVazias === 1){
                vitoriasComputador.push(indices[valores.indexOf('')]);
            }

            if(casasHumano === 2 && casasVazias === 1){
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

        const indiceAleatorio = Math.floor(Math.random() * candidatos.length);
        return candidatos[indiceAleatorio];
    }

    function encontrarForquilhasSeguras(tab){
        return casasLivres(tab).filter(function(indice){
            const simulacao = simularJogada(tab, indice, JOGADOR_COMPUTADOR);
            const ameacasDoHumano = vitoriasImediatas(simulacao, JOGADOR_HUMANO);
            const vitoriasFuturas = vitoriasImediatas(simulacao, JOGADOR_COMPUTADOR);

            return ameacasDoHumano.length === 0 && vitoriasFuturas.length >= 2;
        });
    }

    function encontrarJogadasSegurasContraForquilha(tab){
        return casasLivres(tab).filter(function(indice){
            const simulacao = simularJogada(tab, indice, JOGADOR_COMPUTADOR);
            return !criaForquilhaPerigosa(simulacao);
        });
    }    

    function vitoriasImediatas(tab, jogador){
        return casasLivres(tab).filter(function(indice){
            const simulacao = simularJogada(tab, indice, jogador);
            return verificarVencedor(simulacao, jogador);
        });
    }

    function simularJogada(tab, indice, jogador){
        const simulacao = tab.slice();
        simulacao[indice] = jogador;
        return simulacao;
    }

    function criaForquilhaPerigosa(tab){
        return casasLivres(tab).some(function(indice){
            const respostaHumana = simularJogada(tab, indice, JOGADOR_HUMANO);
            const vitoriasHumanas = vitoriasImediatas(respostaHumana, JOGADOR_HUMANO);
            const vitoriasComputador = vitoriasImediatas(respostaHumana, JOGADOR_COMPUTADOR);

            // Se o computador puder vencer imediatamente, a ameaça humana não
            // chega a acontecer: a partida termina antes da próxima jogada.
            return vitoriasHumanas.length >= 2 && vitoriasComputador.length === 0;
        });
    }

    function limpa(){
        tabuleiro = Array(9).fill('');
        jogadorAtual = JOGADOR_HUMANO;
        $('.jogada').css('background-image', '');
    }

});
