var rodada = 1;
//matriz das posições do tabuleiro iniciadas com o valor zer0
var posicoes = Object.fromEntries(
  ['a', 'b', 'c'].map(linha => [linha, { 1: 0, 2: 0, 3: 0 }])
);
var jogoAtivo = true;
$(document).ready(function(){ //aguarda a página ser carregada... 
    $('#btn_play').click(function(){ //detecta o click no botão
        if($('#inp_jogador1').val()=='' || $('#inp_jogador2').val()==''){ //verifica se os campos nomes estão preenchidos
            $('#mensagem_erro').show();
            return false;
        }
        //ajusta os nomes dos jogadores na tela do tabuleiro
        $('#nome_jogador1').html($('#inp_jogador1').val());
        $('#nome_jogador2').html($('#inp_jogador2').val());

        limpa(); //garante que o tabuleiro esteja zerado
        $('#mensagem_erro').hide(); //esconde a mensagem de erro
        $('#pagina_inicial').hide(); //esconde a tela inicial
        $('#pagina_jogo').show(); //mostra o tabuleiro
    });
    $('.jogada').click(function(){ //detecta o click nas posições do tabuleiro
        let id_campo_clicado = this.id; //guarda o id do campo clicado
        jogada(id_campo_clicado); //chama a função para registrar a jogada
    });

    function jogada(id){
        let icone = '';
        let ponto = 0;
        //O jogo sempre inicia pelo jogador 1, então as jogadas ímpares serão do jogador 1 e as pares do jogador 2
        if((rodada%2) == 1){
            icone='url("img/marcacao1.png")'; //define que a marcacao do jogador 1 deve ser usada
            ponto = -1; //define a pontuação do jogador 1
        } else {
            icone='url("img/marcacao2.png")'; //define que a marcacao do jogador 2 deve ser usada
            ponto = 1; //define a pontuação do jogador 2
        }
        
        let indice = id.split('-'); //separa o id em duas partes, guardando em posições de array diferentes
        if(posicoes[indice[0]][indice[1]] == 0){ //verifica se a posição da matriz não foi ainda preenchida
            $('#'+id).css('background-image', icone); //mostra a marcacao na posição correta do tabuleiro 
            posicoes[indice[0]][indice[1]] = ponto; //armazena a pontuação na posição da matriz correspondente
            let mensagem = '';
            if(verificarVencedor(posicoes)){ //verifica se há ganhador
                if ((rodada%2)==1){ //monta a mensagem recuperando o nome do ganhador
                    mensagem = $('#inp_jogador1').val() + ' ganhou o jogo';
                } else {
                    mensagem = $('#inp_jogador2').val() + ' ganhou o jogo';
                }
                finalizarJogo(mensagem); //mostrar mensagem do vencedor
            } else if(rodada == 9){ //partida chegou ao fim sem vencedor
                mensagem = 'Jogo empatado!';
                finalizarJogo(mensagem); //mostra mensagem de empate
            } else {
                rodada++; //
            }
        }
        
    function verificarVencedor(p) {
        //posições de vitórias
        const combinacoes = [
            // Linhas
            [p.a[1], p.a[2], p.a[3]],
            [p.b[1], p.b[2], p.b[3]],
            [p.c[1], p.c[2], p.c[3]],
            // Colunas
            [p.a[1], p.b[1], p.c[1]],
            [p.a[2], p.b[2], p.c[2]],
            [p.a[3], p.b[3], p.c[3]],
            // Diagonais
            [p.a[1], p.b[2], p.c[3]],
            [p.a[3], p.b[2], p.c[1]]
            ];
        const venceu = combinacoes.some(trio => Math.abs(trio[0] + trio[1] + trio[2]) === 3); //se a soma de alguma combinação foi 3 aconteceu a vitória
        return venceu; //retorna true ou false
    }     
    }

    function limpa(){
    rodada = 1;    //estabelece que será a primeira jogada
    posicoes = Object.fromEntries( //zera a matriz de posições
        ['a', 'b', 'c'].map(linha => [linha, { 1: 0, 2: 0, 3: 0 }])
    );
    $('.jogada').css('background-image', ''); //limpa as imagens do tabuleiro
    }

    function finalizarJogo(texto){
        jogoAtivo = false; 
        $('#texto_mensagem').text(texto); //define a mensagem que será apresentada no final do jogo
        $('#mensagem_box').fadeIn(); //mostra a mensagem
    }
    $('#btn_reiniciar').click(function(){ //verifica se o botão reiniciar foi clicado
        $('#mensagem_box').hide(); //esconde a mensagem do final do joogo
        jogoAtivo = true; 
        limpa(); //limpa a tela 
        $('#pagina_inicial').show(); //mostra a tela inicial
        $('#pagina_jogo').hide();  //esconde o tabuleiro
    });
});