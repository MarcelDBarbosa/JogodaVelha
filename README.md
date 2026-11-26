# 🎮 Jogo da velha

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS) [![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) [![jQuery](https://img.shields.io/badge/jQuery-2.2.1-0769AD?logo=jquery&logoColor=white)](https://jquery.com/) [![Ollama](https://img.shields.io/badge/Ollama-local%20AI-111111?logo=ollama&logoColor=white)](https://ollama.com/)

Implementação do jogo da velha em HTML, CSS e JavaScript. A página principal permite escolher localmente entre um ou dois jogadores, e versões separadas estão disponíveis em pastas próprias:

1. 🎮 `/`: página integrada para um ou dois jogadores;
2. 👥 `two`: dois jogadores humanos;
3. 🤖 `ia`: um jogador humano contra um modelo executado localmente pelo Ollama;
4. 🧠 `auto`: um jogador humano contra o computador, usando uma lógica de decisão em JavaScript.

O projeto não utiliza `npm`, bundler ou backend próprio. A biblioteca jQuery 2.2.1 é mantida localmente no repositório, e todas as páginas a carregam por caminho relativo.

## 📚 Sumário

- [Modalidades](#modalidades)
- [Tecnologias e recursos](#tecnologias-e-recursos)
- [Pré-requisitos](#pré-requisitos)
- [Estrutura de arquivos](#estrutura-de-arquivos)
- [Execução](#execução)
- [Como jogar](#como-jogar)
- [Configuração da versão com Ollama](#configuração-da-versão-com-ollama)
- [Solução de problemas](#solução-de-problemas)

## 🕹️ Modalidades

### 🎮 Página integrada — raiz do projeto

Esta é a entrada recomendada do projeto. Antes de iniciar a partida, a pessoa escolhe entre os modos **Um jogador** e **Dois jogadores**.

- 🧠 No modo de um jogador, o computador utiliza a mesma lógica estratégica da pasta `auto`.
- 👥 No modo de dois jogadores, as jogadas alternam entre `X` e `O` no mesmo navegador.
- 🧩 Os dois modos usam um vetor de nove posições para representar o tabuleiro e compartilham as regras de vitória, empate e bloqueio de casas ocupadas.
- ↩️ Os formulários permitem voltar à escolha do modo; ao terminar uma partida, **Jogar Novamente** retorna diretamente ao formulário do modo que foi selecionado.
- 🖼️ A ilustração de abertura aparece durante a escolha e o preenchimento dos nomes, sendo ocultada apenas enquanto o tabuleiro está visível.

### 👥 Dois humanos — `two`

Essa é a versão tradicional para duas pessoas no mesmo computador.

- ✍️ O jogador 1 informa o próprio nome e o jogador 2 informa o seu nome.
- ▶️ A partida começa sempre pelo jogador 1.
- 🔄 As jogadas são alternadas entre os dois jogadores.
- 🟦 Cada jogador pode selecionar uma casa livre do tabuleiro.
- 🏆 A partida termina quando um jogador completa uma linha, coluna ou diagonal, ou quando todas as nove casas são ocupadas.
- O estado do tabuleiro é armazenado em uma matriz de objetos, usando `-1` para o jogador 1, `1` para o jogador 2 e `0` para uma casa vazia.

### 🤖 Humano contra Ollama — `ia`

Nessa versão, o jogador humano usa `X` e enfrenta a IA, que usa `O`. A IA não é executada no navegador: o JavaScript envia o estado atual do tabuleiro para uma instância local do Ollama.

- 🔌 Endpoint usado pelo código: `http://localhost:11434/api/chat`.
- 🧩 Modelo configurado no código: `gemma4:e2b-it-qat`.
- 🗺️ A requisição informa o tabuleiro, as combinações vencedoras e as casas livres.
- 📦 A resposta esperada é um JSON no formato `{"jogada": número}`.
- 🎯 A temperatura usada na chamada é `0.1`, favorecendo respostas mais consistentes.
- ⏳ O navegador bloqueia novas jogadas enquanto a IA está processando a resposta.
- 🔁 São feitas até duas tentativas quando a resposta é inválida, quando ocorre erro ou quando a requisição ultrapassa o limite de 120 segundos.
- 🛟 Se as tentativas não produzirem uma jogada válida, o jogo aplica automaticamente a primeira casa livre como fallback, evitando que a partida fique travada.

Essa modalidade exige que o Ollama esteja instalado, em execução e com o modelo configurado já baixado. A instalação e a preparação estão descritas em [Configuração da versão com Ollama](#configuração-da-versão-com-ollama).

### 🧠 Humano contra computador — `auto`

Essa versão usa uma lógica local, sem chamadas de rede e sem modelo de IA. O jogador humano usa `X` e o computador usa `O`.

Para escolher uma jogada, o computador analisa as casas disponíveis nesta ordem geral:

1. 🏆 procura uma jogada que gere vitória imediata;
2. 🍴 procura uma jogada que crie uma forquilha segura, ou seja, duas ameaças futuras;
3. 🛡️ bloqueia uma vitória imediata do jogador humano;
4. 🚧 evita jogadas que permitam uma forquilha perigosa do adversário;
5. 🎯 escolhe o centro, se estiver livre;
6. ◼️ escolhe um dos cantos livres;
7. ↔️ escolhe uma das laterais restantes.

Quando existem várias jogadas equivalentes, a função `sortear` escolhe uma delas aleatoriamente. Por isso, partidas com a mesma sequência inicial podem continuar de maneiras diferentes.

## 🧰 Tecnologias e recursos

- 🧱 **HTML5**: estrutura das telas inicial e de jogo, campos de nome, tabuleiro e mensagens de resultado.
- 🎨 **CSS3**: layout do tabuleiro, bordas, imagens dos jogadores, marcações e mensagens de status.
- ⚙️ **JavaScript moderno (ES6+)**: controle do estado, validação das jogadas, verificação de vitórias, escolha das jogadas do computador e integração com o Ollama.
- 🔧 **jQuery 2.2.1**: eventos, manipulação do DOM, estilos e efeitos visuais como `fadeIn`.
- 🌐 **Fetch API**: comunicação da modalidade `ia` com a API local do Ollama.
- 🖥️ **Ollama**: execução local do modelo de linguagem usado pela modalidade `ia`.
- ✨ **Gemma 4**: modelo configurado atualmente em `ia/jogo.js` como `gemma4:e2b-it-qat`.
- 🖼️ **Imagens PNG**: avatares, botão de início e marcações das jogadas.

## ✅ Pré-requisitos

Para a página integrada e as modalidades `two` e `auto`:

- um navegador moderno com suporte a JavaScript;
- um servidor HTTP local, recomendado para servir os arquivos do projeto.

Para a modalidade `ia`, além dos itens anteriores:

- Ollama instalado localmente;
- o modelo `gemma4:e2b-it-qat` disponível no Ollama;
- o serviço do Ollama acessível em `http://localhost:11434`.

Não é necessário instalar Node.js, `npm` ou dependências de terceiros para executar as modalidades do projeto.

## 🌳 Estrutura de arquivos

```text
.
├── README.md                    # Documentação do projeto e instruções de execução
├── index.html                   # Página integrada para escolher um ou dois jogadores
├── jogo.js                      # Regras compartilhadas e controle de telas da página integrada
├── style.css                    # Estilos desktop e responsivos da página integrada
├── jquery-2.2.1.js              # Biblioteca jQuery usada localmente pelas páginas do projeto
├── img/                         # Recursos visuais usados pela página integrada
│   ├── 1jog.png                 # Ilustração/opção para o modo de um jogador
│   ├── 2jogs.png                # Ilustração/opção para o modo de dois jogadores
│   ├── titulo.png               # Ilustração de abertura da página principal
│   └── ...                      # Avatares, botão de iniciar e marcações do tabuleiro
├── two/                          # Jogo para dois jogadores humanos
│   ├── index.html                # Tela inicial e tabuleiro da modalidade para dois humanos
│   ├── jogo.js                   # Turnos, estado, validação e resultado da partida
│   ├── style.css                 # Estilos da tela e do tabuleiro
│   └── img/                      # Avatares, botão de jogar e imagens das marcações
│       ├── Jogador3.png          # Imagem adicional presente nos recursos da modalidade
│       ├── jogador1.png          # Avatar do jogador 1
│       ├── jogador2.png          # Avatar do jogador 2
│       ├── marcacao1.png         # Marca visual do jogador 1
│       ├── marcacao2.png         # Marca visual do jogador 2
│       └── play.png              # Botão/imagem para iniciar a partida
├── ia/                           # Jogo para humano contra Ollama
│   ├── index.html                # Tela com jogador humano, IA e status de processamento
│   ├── jogo.js                   # Integração com Ollama e regras da partida
│   ├── style.css                 # Estilos do tabuleiro e do status da IA
│   └── img/                      # Avatares, botão de jogar e imagens das marcações
│       ├── jogador1.png          # Avatar do jogador humano
│       ├── jogador3.png          # Avatar da IA
│       ├── marcacao1.png         # Marca visual do jogador humano
│       ├── marcacao2.png         # Marca visual da IA
│       └── play.png              # Botão/imagem para iniciar a partida
└── auto/                         # Jogo para humano contra o computador lógico
    ├── index.html                # Tela inicial e tabuleiro da modalidade automática
    ├── jogo.js                   # Regras e algoritmo de escolha do computador
    ├── style.css                 # Estilos da tela e do tabuleiro
    └── img/                      # Avatares, botão de jogar e imagens das marcações
        ├── jogador1.png          # Avatar do jogador humano
        ├── jogador3.png          # Avatar do computador
        ├── marcacao1.png         # Marca visual do jogador humano
        ├── marcacao2.png         # Marca visual do computador
        └── play.png              # Botão/imagem para iniciar a partida
```

## 🚀 Execução

### 1. 📥 Obter o projeto

Clone o repositório e entre na pasta raiz:

```bash
git clone <URL_DO_REPOSITORIO>
cd jogo_da_velha
```

### 2. 🌐 Iniciar um servidor HTTP local

Na raiz do projeto, execute:

```bash
python3 -m http.server 8000
```

O servidor ficará disponível em `http://localhost:8000`. Mantenha esse terminal aberto enquanto estiver jogando.

Também é possível usar qualquer outro servidor HTTP estático. Não é recomendado abrir os arquivos pelo caminho `file://`, especialmente na modalidade com Ollama, porque o navegador pode restringir requisições e origens locais.

### 3. 🎮 Executar a página integrada

Abra:

```text
http://localhost:8000/
```

Escolha **Um jogador** para enfrentar o computador ou **Dois jogadores** para uma partida local. Em ambos os formulários, o link **Trocar modo de jogo** retorna à escolha inicial. Após a partida, **Jogar Novamente** volta ao mesmo modo selecionado.

### 4. 👥 Executar a versão para dois humanos

Abra:

```text
http://localhost:8000/two/
```

Depois:

1. informe o nome do jogador 1;
2. informe o nome do jogador 2;
3. clique no botão de iniciar;
4. os jogadores alternam as jogadas no tabuleiro;
5. ao final, use **Jogar Novamente** para voltar à tela inicial.

### 5. 🧠 Executar a versão contra o computador

Abra:

```text
http://localhost:8000/auto/
```

Informe o nome do jogador humano e clique no botão de iniciar. O jogador humano sempre começa; depois de cada jogada válida, o computador faz sua jogada imediatamente.

### 6. 🤖 Executar a versão contra o Ollama

Primeiro prepare o Ollama conforme a seção seguinte. Com o servidor HTTP do projeto e o Ollama em execução, abra:

```text
http://localhost:8000/ia/
```

Informe o nome do jogador humano e clique no botão de iniciar. Após cada jogada humana, aguarde o status **A IA está processando a próxima jogada...** desaparecer. O tabuleiro fica temporariamente bloqueado enquanto a requisição está em andamento.

## 🤖 Configuração da versão com Ollama

### 📦 Instalar e iniciar o Ollama

Instale o Ollama seguindo as instruções oficiais para o seu sistema operacional. Em seguida, confirme que o comando está disponível:

```bash
ollama --version
```

Baixe o modelo usado pelo projeto:

```bash
ollama pull gemma4:e2b-it-qat
```

Se o Ollama não estiver rodando como aplicativo/serviço no seu sistema, inicie-o com:

```bash
ollama serve
```

Em uma instalação padrão, a API fica disponível em `http://localhost:11434`. O código usa diretamente o endpoint `/api/chat`.

### 🔐 Permitir a origem do servidor local

O Ollama permite origens locais comuns, incluindo `localhost` e `127.0.0.1`. Se o navegador exibir um erro de CORS, configure explicitamente a origem usada pelo servidor do projeto e reinicie o Ollama.

No macOS ou Linux:

```bash
export OLLAMA_ORIGINS="http://localhost:8000,http://127.0.0.1:8000"
ollama serve
```

No Windows PowerShell:

```powershell
$env:OLLAMA_ORIGINS="http://localhost:8000,http://127.0.0.1:8000"
ollama serve
```

Use no navegador o mesmo host configurado na variável. Por exemplo, se a origem permitida for `http://localhost:8000`, abra `http://localhost:8000/ia/`, e não uma combinação diferente de host e porta.

### 🔄 Trocar o modelo

O nome do modelo está definido no início de `ia/jogo.js`:

```javascript
const MODELO_IA = 'gemma4:e2b-it-qat';
```

Para usar outro modelo compatível com Ollama:

1. baixe-o com `ollama pull <nome-do-modelo>`;
2. altere `MODELO_IA` para o mesmo nome;
3. reinicie a partida no navegador.

O modelo precisa obedecer ao formato solicitado pelo código: responder com um objeto JSON contendo uma propriedade inteira chamada `jogada`.

## 🎲 Como jogar

- 🔢 A casa superior esquerda corresponde ao índice `0` na modalidade `ia` e `auto`.
- A numeração segue da esquerda para a direita e de cima para baixo:

```text
0 | 1 | 2
--+---+--
3 | 4 | 5
--+---+--
6 | 7 | 8
```

- 🏆 Uma vitória acontece ao completar qualquer linha, coluna ou diagonal.
- 🤝 Uma partida sem casas livres e sem vencedor termina empatada.
- 🚫 Casas já ocupadas não podem ser selecionadas novamente.
- 🔁 Para começar outra partida, clique em **Jogar Novamente**.

## 🧯 Solução de problemas

### 🖥️ A página não carrega ou aparece sem funcionamento

Confirme se o servidor foi iniciado na raiz do projeto e se a URL contém a pasta correta:

```text
http://localhost:8000/two/
http://localhost:8000/auto/
http://localhost:8000/ia/
```

Abra o console do navegador para verificar erros de carregamento de scripts ou imagens.

### 🤖 A modalidade `ia` não responde

Verifique, nesta ordem:

1. o Ollama está em execução;
2. o modelo `gemma4:e2b-it-qat` foi baixado;
3. a API responde em `http://localhost:11434`;
4. a origem `http://localhost:8000` está permitida;
5. o navegador foi aberto pelo servidor HTTP, e não por `file://`.

Também é possível testar a disponibilidade do modelo diretamente no terminal:

```bash
ollama run gemma4:e2b-it-qat
```

### 🔒 O navegador informa erro de CORS

Inicie o Ollama com `OLLAMA_ORIGINS` configurado para a origem exata que aparece na barra do navegador. A porta faz parte da origem; portanto, `8000` e `8080` são origens diferentes.

### 🧩 O modelo responde, mas a jogada não é aplicada

A resposta precisa ser JSON válido, com uma jogada inteira que corresponda a uma casa livre. A implementação tenta novamente até duas vezes e, se ainda não encontrar uma resposta válida, usa automaticamente a primeira casa livre disponível.

## 🔗 Referências

- [Documentação do Ollama](https://docs.ollama.com/)
- [Configuração de origens permitidas no Ollama](https://github.com/ollama/ollama/blob/main/docs/faq.mdx)
- [Documentação do jQuery](https://api.jquery.com/)
