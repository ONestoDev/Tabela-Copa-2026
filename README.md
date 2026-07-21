<div align="center">

# 🏆 Tabela da Copa do Mundo 2026

Aplicação web para acompanhar partidas, calcular classificações, organizar o mata-mata e gerenciar palpites da Copa do Mundo de 2026.

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge\&logo=javascript\&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-Interface-E34F26?style=for-the-badge\&logo=html5\&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Estilização-1572B6?style=for-the-badge\&logo=css3\&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-Build-8DD6F9?style=for-the-badge\&logo=webpack\&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deploy-222222?style=for-the-badge\&logo=github)
![Status](https://img.shields.io/badge/Status-Em_evolução-yellow?style=for-the-badge)

</div>

---

## 📌 Sobre o projeto

A **Tabela da Copa 2026** é uma aplicação web desenvolvida para acompanhar e simular a competição.

O sistema permite registrar resultados das partidas, calcular automaticamente a classificação dos grupos, organizar as seleções classificadas para o mata-mata e controlar palpites realizados por diferentes participantes.

O projeto começou como uma tabela simples em HTML e evoluiu para uma aplicação modular em JavaScript, com separação entre:

* estado da aplicação;
* regras de negócio;
* renderização;
* persistência;
* integração com serviços externos;
* controle das telas.

---

## ✨ Funcionalidades

### Competição

* cadastro e edição de resultados;
* classificação automática;
* cálculo de pontos;
* saldo de gols;
* gols marcados e sofridos;
* ordenação dos grupos;
* ranking dos melhores terceiros colocados;
* geração do mata-mata;
* acompanhamento das fases eliminatórias.

### Palpites

* cadastro de participantes;
* registro de palpites;
* cálculo de pontuação;
* ranking dos participantes;
* acompanhamento dos resultados.

### Persistência

* armazenamento no navegador com LocalStorage;
* sincronização opcional com Google Sheets;
* recuperação dos dados em acessos posteriores.

### Interface

* tema padrão;
* tema escuro;
* tema Brasil;
* navegação entre telas;
* interface responsiva.

### Estatísticas externas

* partidas;
* resultados;
* classificação;
* artilharia;
* assistências;
* cartões;
* jogos em andamento.

---

## 🧠 Regras da classificação

A tabela utiliza indicadores como:

| Sigla | Significado   |
| ----- | ------------- |
| `P`   | Pontos        |
| `J`   | Jogos         |
| `V`   | Vitórias      |
| `E`   | Empates       |
| `D`   | Derrotas      |
| `GP`  | Gols pró      |
| `GC`  | Gols contra   |
| `SG`  | Saldo de gols |

Pontuação:

```text
Vitória  = 3 pontos
Empate   = 1 ponto
Derrota  = 0 pontos
```

Os critérios de desempate devem seguir a ordem definida nas regras da aplicação.

---

## 🏟️ Fases representadas

```text
Fase de grupos
      ↓
Classificação dos grupos
      ↓
Melhores terceiros colocados
      ↓
Primeira fase eliminatória
      ↓
Oitavas de final
      ↓
Quartas de final
      ↓
Semifinais
      ↓
Final
```

---

## 🏗️ Arquitetura do frontend

O projeto utiliza JavaScript modular para separar responsabilidades.

```text
js/
├── core/
├── data/
├── renderers/
└── services/
```

### `core`

Responsável por:

* regras da competição;
* cálculos;
* gerenciamento de estado;
* controle dos fluxos principais.

### `data`

Contém:

* dados das seleções;
* partidas;
* grupos;
* estatísticas obtidas externamente.

### `renderers`

Responsável por:

* gerar elementos da interface;
* atualizar tabelas;
* exibir partidas;
* exibir rankings;
* renderizar o mata-mata.

### `services`

Responsável por:

* persistência;
* comunicação com Google Sheets;
* consumo ou leitura de dados externos;
* armazenamento no navegador.

---

## 🔄 Fluxo da aplicação

```text
Usuário informa um resultado
           ↓
Estado da partida é atualizado
           ↓
Classificação é recalculada
           ↓
Interface é renderizada novamente
           ↓
Dados são persistidos
```

---

## 📊 Atualização das estatísticas

O projeto possui um script responsável por consultar dados da competição e gerar um arquivo local consumido pelo frontend.

```text
football-data.org
        ↓
Script Node.js
        ↓
Normalização dos dados
        ↓
js/data/apiStats.json
        ↓
Interface da aplicação
```

O script trabalha com diferentes tempos de cache:

* informações da competição;
* equipes;
* partidas;
* classificação;
* artilharia;
* partidas ao vivo.

Também possui um limite interno de requisições para evitar consumo excessivo da API.

---

## 🔐 Chave da API

A chave da `football-data.org` não deve ser adicionada ao código do frontend.

No GitHub, configure:

```text
Settings
→ Secrets and variables
→ Actions
```

Crie o secret:

```text
FOOTBALL_DATA_TOKEN
```

O token será utilizado pelo workflow de atualização das estatísticas.

---

## 💾 Persistência

### LocalStorage

Armazena os dados diretamente no navegador.

É adequado para:

* testes locais;
* uso individual;
* desenvolvimento;
* demonstrações.

Limitação:

> Os dados permanecem apenas no navegador e no dispositivo utilizados.

### Google Sheets

A integração com Google Sheets permite utilizar uma planilha como armazenamento compartilhado.

Isso possibilita:

* acesso por diferentes usuários;
* compartilhamento dos resultados;
* centralização dos palpites;
* consulta dos dados fora da aplicação.

A configuração está documentada em:

```text
google-apps-script/
```

---

## 🛠️ Tecnologias

| Tecnologia         | Utilização                          |
| ------------------ | ----------------------------------- |
| HTML5              | Estrutura da interface              |
| CSS3               | Estilização e responsividade        |
| JavaScript         | Regras, interações e renderização   |
| Webpack            | Build e servidor de desenvolvimento |
| Node.js            | Execução dos scripts auxiliares     |
| LocalStorage       | Persistência no navegador           |
| Google Apps Script | Integração com Google Sheets        |
| Google Sheets      | Armazenamento compartilhado         |
| football-data.org  | Dados externos da competição        |
| GitHub Actions     | Atualização automatizada            |
| GitHub Pages       | Publicação da aplicação             |

---

## 📁 Estrutura do projeto

```text
Tabela-Copa-2026/
│
├── .github/
│   └── workflows/
│
├── css/
│
├── google-apps-script/
│
├── js/
│   ├── core/
│   ├── data/
│   ├── renderers/
│   └── services/
│
├── scripts/
│   └── updateFootballStats.js
│
├── index.html
├── package.json
├── package-lock.json
├── webpack.common.js
├── webpack.config.dev.js
├── webpack.config.prod.js
└── README.md
```

---

## 🚀 Como executar

### Pré-requisitos

* Node.js;
* npm;
* Git.

Verifique as versões:

```bash
node --version
npm --version
```

### Clone o repositório

```bash
git clone https://github.com/ONestoDev/Tabela-Copa-2026.git
```

### Acesse a pasta

```bash
cd Tabela-Copa-2026
```

### Instale as dependências

```bash
npm install
```

### Inicie o ambiente de desenvolvimento

```bash
npm start
```

O Webpack iniciará o servidor e abrirá a aplicação no navegador.

---

## 🏗️ Build de produção

```bash
npm run build
```

Os arquivos otimizados serão gerados para publicação.

---

## 📊 Atualização manual das estatísticas

Com o token configurado no ambiente:

```bash
npm run stats:update
```

Esse comando executa:

```text
scripts/updateFootballStats.js
```

e atualiza:

```text
js/data/apiStats.json
```

---

## 📜 Scripts disponíveis

```json
{
  "start": "webpack serve --open --config webpack.config.dev.js",
  "build": "webpack --config webpack.config.prod.js",
  "stats:update": "node scripts/updateFootballStats.js"
}
```

---

## 🌐 Deploy

O projeto está preparado para publicação com GitHub Pages.

O workflow pode:

1. instalar as dependências;
2. atualizar as estatísticas;
3. gerar o build;
4. publicar o site;
5. registrar mudanças no arquivo de dados.

---

## 🧪 Testes recomendados

| Cenário                   | Resultado esperado                |
| ------------------------- | --------------------------------- |
| Vitória por placar válido | Três pontos para o vencedor       |
| Empate                    | Um ponto para cada seleção        |
| Resultado editado         | Classificação recalculada         |
| Saldo de gols igual       | Próximo critério utilizado        |
| Partida sem resultado     | Não contabilizada                 |
| Dados salvos              | Informações recuperadas           |
| Palpite correto           | Pontuação atribuída               |
| API indisponível          | Aplicação continua funcionando    |
| Token ausente             | Atualização externa não executada |
| Grupo completo            | Classificados definidos           |

---

## ⚠️ Limitações

* LocalStorage não sincroniza dispositivos;
* Google Sheets não substitui um backend completo;
* dados externos dependem da disponibilidade da API;
* algumas estatísticas podem não estar disponíveis antes ou durante determinadas fases;
* não existe autenticação de usuários;
* não existe painel administrativo completo;
* não há testes automatizados configurados;
* resultados inseridos manualmente podem divergir dos dados externos;
* a aplicação ainda não possui banco de dados próprio.

---

## 🗺️ Roadmap

* [x] fase de grupos;
* [x] classificação automática;
* [x] melhores terceiros colocados;
* [x] mata-mata;
* [x] sistema de palpites;
* [x] ranking;
* [x] tema escuro;
* [x] tema Brasil;
* [x] persistência com LocalStorage;
* [x] integração com Google Sheets;
* [x] atualização externa de estatísticas;
* [ ] testes automatizados;
* [ ] painel administrativo;
* [ ] autenticação;
* [ ] melhorias na experiência mobile;
* [ ] estatísticas detalhadas dos participantes;
* [ ] validação entre resultados manuais e oficiais.

---

## 📚 Aprendizados desenvolvidos

Durante o projeto foram praticados:

* JavaScript modular;
* manipulação do DOM;
* separação de responsabilidades;
* gerenciamento de estado;
* regras de negócio;
* classificação esportiva;
* persistência local;
* integração com serviços externos;
* automação com GitHub Actions;
* configuração do Webpack;
* publicação no GitHub Pages.

---

## ⚖️ Aviso

Este é um projeto independente, desenvolvido para fins educacionais.

Não possui vínculo oficial com a FIFA ou com os organizadores da Copa do Mundo.

Dados, nomes e marcas pertencem aos seus respectivos proprietários.

---

## 👨‍💻 Autor

Desenvolvido por **Ernesto — ONestoDev**.

[![GitHub](https://img.shields.io/badge/GitHub-ONestoDev-181717?style=for-the-badge\&logo=github)](https://github.com/ONestoDev)

---

## 📄 Licença

O projeto declara a licença MIT.

Mantenha um arquivo `LICENSE` na raiz para formalizar as condições de uso, modificação e distribuição.
