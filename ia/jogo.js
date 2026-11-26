const URL_OLLAMA = 'http://localhost:11434/api/chat';
const MODELO_IA = 'gemma4:e2b-it-qat';
const JOGADOR_HUMANO = 'X';
const JOGADOR_IA = 'O';
const MAX_TENTATIVAS_IA = 2;
const TEMPO_MAXIMO_IA_MS = 120000;

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
let aguardandoIA = false;
let identificadorPartida = 0;

$(document).ready(function(){
    $('#btn_play').click(iniciarJogo);
    $('.jogada').click(function(){
        jogarHumano(this.id);
    });

    $('#btn_reiniciar').click(function(){
        identificadorPartida++;
        $('#mensagem_box').hide();
        $('#status_ia').hide().text('A IA está processando sua jogada...');
        jogoAtivo = true;
        aguardandoIA = false;
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

        identificadorPartida++;
        jogoAtivo = true;
        aguardandoIA = false;
        limpa();
        $('#mensagem_erro').hide();
        $('#pagina_inicial').hide();
        $('#pagina_jogo').show();
    }

    function jogarHumano(id){
        if(!jogoAtivo || aguardandoIA){
            return;
        }

        const indice = idParaIndice(id);
        if(!registrarJogada(indice, JOGADOR_HUMANO)){
            return;
        }

        if(!jogoAtivo){
            return;
        }

        solicitarJogadaIA(identificadorPartida);
    }

    function idParaIndice(id){
        const partes = String(id).split('-');
        const linha = { a: 0, b: 1, c: 2 }[partes[0]];
        const coluna = Number(partes[1]) - 1;

        if(linha === undefined || !Number.isInteger(coluna) || coluna < 0 || coluna > 2){
            return -1;
        }

        return linha * 3 + coluna;
    }

    function indiceParaId(indice){
        const linhas = ['a', 'b', 'c'];
        return linhas[Math.floor(indice / 3)] + '-' + ((indice % 3) + 1);
    }

    function registrarJogada(indice, jogador){
        if(!jogoAtivo || !Number.isInteger(indice) || indice < 0 || indice > 8){
            return false;
        }

        if(tabuleiro[indice] !== ''){
            return false;
        }

        tabuleiro[indice] = jogador;
        $('#' + indiceParaId(indice)).css(
            'background-image',
            jogador === JOGADOR_HUMANO
                ? 'url("img/marcacao1.png")'
                : 'url("img/marcacao2.png")'
        );

        if(verificarVencedor(jogador)){
            const nome = jogador === JOGADOR_HUMANO
                ? $('#nome_jogador1').text()
                : $('#nome_jogador2').text();
            finalizarJogo(nome + ' ganhou o jogo');
        } else if(tabuleiro.every(casa => casa !== '')){
            finalizarJogo('Jogo empatado!');
        }

        return true;
    }

    function verificarVencedor(jogador){
        return LINHAS_VITORIA.some(([a, b, c]) =>
            tabuleiro[a] === jogador &&
            tabuleiro[b] === jogador &&
            tabuleiro[c] === jogador
        );
    }

    function casasLivres(){
        return tabuleiro.reduce(function(livres, casa, indice){
            if(casa === ''){
                livres.push(indice);
            }
            return livres;
        }, []);
    }

    async function solicitarJogadaIA(partida){
        if(!jogoAtivo || partida !== identificadorPartida){
            return;
        }

        aguardandoIA = true;
        atualizarStatusIA('A IA está processando a próxima jogada...');

        try{
            let jogada = null;

            for(let tentativa = 1; tentativa <= MAX_TENTATIVAS_IA; tentativa++){
                let mensagemNovaTentativa = 'A resposta da IA foi inválida. Reenviando a requisição...';

                try{
                    jogada = await pedirJogadaIA();
                } catch(erro){
                    if(erro.name === 'AbortError'){
                        console.warn('A IA excedeu o tempo máximo de 120 segundos.');
                        mensagemNovaTentativa = 'A IA excedeu 120 segundos. Reenviando a requisição...';
                    } else {
                        console.warn('Não foi possível obter uma jogada da IA:', erro);
                        mensagemNovaTentativa = 'Não foi possível obter a jogada. Reenviando a requisição...';
                    }
                }

                if(partida !== identificadorPartida || !jogoAtivo){
                    return;
                }

                if(jogadaValida(jogada)){
                    break;
                }

                jogada = null;
                if(tentativa < MAX_TENTATIVAS_IA){
                    atualizarStatusIA(mensagemNovaTentativa);
                }
            }

            if(partida !== identificadorPartida || !jogoAtivo){
                return;
            }

            if(!jogadaValida(jogada)){
                const livres = casasLivres();
                jogada = livres.length > 0 ? livres[0] : null;
                atualizarStatusIA('A IA não respondeu corretamente. Aplicando uma jogada válida...');
            }

            if(jogada !== null){
                registrarJogada(jogada, JOGADOR_IA);
            }
        } finally {
            aguardandoIA = false;
            $('#status_ia').hide();
            $('.tabuleiro').removeClass('aguardando-ia');
        }
    }

    async function pedirJogadaIA(){
        const livres = casasLivres();
        if(livres.length === 0){
            return null;
        }

        const controlador = new AbortController();
        const temporizador = setTimeout(() => {
            controlador.abort();
        }, TEMPO_MAXIMO_IA_MS);

        try{
            const resposta = await fetch(URL_OLLAMA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controlador.signal,
                body: JSON.stringify({
                    model: MODELO_IA,
                    messages: [{ role: 'user', content: montarPrompt(livres) }],
                    stream: false,
                    keep_alive: '10m',
                    options: { temperature: 0.1 },
                    format: {
                        type: 'object',
                        properties: {
                            jogada: { type: 'integer', enum: livres }
                        },
                        required: ['jogada']
                    }
                })
            });

            if(!resposta.ok){
                throw new Error('Ollama respondeu HTTP ' + resposta.status);
            }

            const dados = await resposta.json();
            const conteudo = dados && dados.message && dados.message.content;
            if(typeof conteudo !== 'string'){
                throw new Error('Resposta da IA sem message.content');
            }

            const resultado = JSON.parse(conteudo);
            return resultado.jogada;
        } finally {
            clearTimeout(temporizador);
        }
    }

    function montarPrompt(livres){
        return `Você é o jogador "O" em um jogo da velha contra o jogador "X".
O tabuleiro usa índices de 0 a 8, da esquerda para a direita e de cima para baixo.
Combinações vencedoras: (0,1,2), (3,4,5), (6,7,8), (0,3,6), (1,4,7), (2,5,8), (0,4,8), (2,4,6).
Estado atual do tabuleiro: ${JSON.stringify(tabuleiro)}
Casas livres permitidas: ${JSON.stringify(livres)}
Escolha a melhor jogada: vença imediatamente se possível; caso contrário, bloqueie o X se necessário.
Responda somente em JSON no formato {"jogada": número}, usando uma casa livre.`;
    }

    function jogadaValida(jogada){
        return Number.isInteger(jogada) &&
            jogada >= 0 &&
            jogada <= 8 &&
            tabuleiro[jogada] === '';
    }

    function atualizarStatusIA(texto){
        $('#status_ia').text(texto).show();
        $('.tabuleiro').addClass('aguardando-ia');
    }

    function limpa(){
        tabuleiro = Array(9).fill('');
        $('.jogada').css('background-image', '');
        $('#status_ia').hide().text('A IA está processando sua jogada...');
        $('.tabuleiro').removeClass('aguardando-ia');
    }

    function finalizarJogo(texto){
        jogoAtivo = false;
        $('#status_ia').hide();
        $('#texto_mensagem').text(texto);
        $('#mensagem_box').fadeIn();
    }
});
