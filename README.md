# 🏆 Tabela Copa 2026

Aplicação web interativa para acompanhar a **Copa do Mundo FIFA 2026**, com fase de grupos, mata-mata, classificação automática, palpites por usuário e sincronização opcional com Google Sheets.

## 📌 Sobre o projeto

O projeto nasceu como uma tabela simples em HTML e evoluiu para uma aplicação modular em JavaScript, separando responsabilidades como estado da aplicação, regras de negócio, renderização, controle de telas e persistência de dados.

A proposta é permitir que usuários acompanhem os jogos da Copa 2026, registrem resultados, façam palpites e visualizem rankings de pontuação.

---

## 🚀 Funcionalidades

- Cadastro e edição de resultados da fase de grupos
- Filtro de jogos por grupo, do Grupo A ao Grupo L
- Tabela de classificação automática por grupo
- Ranking dos melhores terceiros colocados
- Estrutura completa do mata-mata
- Avanço automático dos classificados
- Palpites da fase de grupos por usuário
- Palpites do mata-mata por usuário
- Ranking de palpites
- Bloqueio de palpites após o lançamento do resultado
- Botão discreto para editar resultados já preenchidos
- Indicador visual de sincronização
- Tema escuro
- Tema Brasil
- Persistência local com `localStorage`
- Sincronização opcional com Google Sheets via Google Apps Script
- Deploy preparado para GitHub Pages

---

## 🎯 Sistema de pontuação

| Resultado do palpite | Pontuação |
|---|---:|
| Placar exato | 50 pontos |
| Acertou vencedor ou empate | 25 pontos |
| Errou o resultado | 0 pontos |

Feedbacks exibidos:

- 🎯 Na mosca
- ⚽ Quase crava
- 😬 Que azar

---

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Webpack
- GitHub Pages
- Google Sheets
- Google Apps Script

---

## 📁 Estrutura do projeto

```txt
.
├── css/
│   └── style.css
├── google-apps-script/
│   ├── Code.gs
│   └── README.md
├── js/
│   ├── app.js
│   ├── core/
│   │   ├── appController.js
│   │   ├── appState.js
│   │   ├── overviewController.js
│   │   ├── predictionsController.js
│   │   ├── scoresController.js
│   │   └── uiHelpers.js
│   ├── data/
│   │   └── worldCupData.js
│   ├── renderers/
│   │   ├── heroRenderer.js
│   │   ├── knockoutRenderer.js
│   │   ├── matchesRenderer.js
│   │   ├── predictionsRenderer.js
│   │   ├── resultsRenderer.js
│   │   └── standingsRenderer.js
│   └── services/
│       ├── knockoutService.js
│       ├── predictionService.js
│       ├── standingsService.js
│       └── storageService.js
├── index.html
├── package.json
├── webpack.common.js
├── webpack.config.dev.js
└── webpack.config.prod.js

▶️ Como rodar localmente

Clone o repositório:

git clone https://github.com/ONestoDev/Tabela-Copa-2026.git

Acesse a pasta do projeto:

cd Tabela-Copa-2026

Instale as dependências:

npm install

Inicie o servidor de desenvolvimento:

npm start

Gere a versão de produção:

npm run build
💾 Persistência de dados

O projeto possui uma camada de persistência em:

js/services/storageService.js

Atualmente, existem dois modos de armazenamento.

LocalStorage

Usa o armazenamento local do navegador.

const storageConfig = {
  provider: 'local',
  key: 'copa2026-novo',
  endpoint: ''
};
Google Sheets

Usa uma planilha Google como base de dados simples e compartilhada.

const storageConfig = {
  provider: 'googleSheets',
  key: 'copa2026-novo',
  endpoint: 'URL_DO_APPS_SCRIPT'
};

O script responsável pela integração está em:

google-apps-script/Code.gs

As instruções completas estão em:

google-apps-script/README.md
🌐 Deploy

O projeto está preparado para deploy no GitHub Pages.

O workflow de publicação está em:

.github/workflows/static.yml

Fluxo recomendado:

git add .
git commit -m "Atualiza tabela da Copa 2026"
git push

Após o push, o GitHub Pages publica automaticamente a nova versão.

📌 Observações importantes
O diretório dist/ é gerado automaticamente pelo build.
O arquivo google-apps-script/Code.gs não roda no navegador.
Para usar Google Sheets, o script precisa ser publicado como App da Web no Google Apps Script.
Enquanto o provider estiver como local, os dados ficam salvos apenas no navegador atual.
Para autenticação, permissões avançadas ou controle de usuários, uma evolução futura pode usar Firebase, Supabase ou outro backend.
🧭 Próximas melhorias
Melhorar experiência mobile
Adicionar autenticação de usuários
Criar histórico de alterações nos resultados
Melhorar tratamento de erros da sincronização
Adicionar tela administrativa
Criar testes automatizados
Melhorar acessibilidade
Criar documentação visual com screenshots
👨‍💻 Autor

Desenvolvido por ONestoDev.

GitHub: @ONestoDev

📄 Licença

Este projeto está sob licença MIT.
