# Copa do Mundo 2026 - Tabela, Resultados e Palpites

Aplicacao web para acompanhar a Copa do Mundo FIFA 2026 com fase de grupos, mata-mata, tabela de classificacao, ranking de palpites e sincronizacao via Google Sheets.

O projeto nasceu como uma tabela interativa em HTML e evoluiu para uma aplicacao modular, com separacao entre estado, regras de negocio, renderizacao, controllers e persistencia.

## Recursos

- Cadastro e edicao dos resultados da fase de grupos.
- Filtro de jogos por grupo, de `Grupo A` ate `Grupo L`.
- Tabela de classificacao por grupo.
- Ranking dos melhores terceiros colocados.
- Estrutura completa do mata-mata.
- Avanco automatico dos classificados conforme os resultados sao preenchidos.
- Palpites da fase de grupos por usuario.
- Palpites do mata-mata por usuario.
- Pontuacao dos palpites:
  - `50 pontos` para placar exato.
  - `25 pontos` para acertar vencedor ou empate.
  - `0 pontos` para erro.
- Feedback dos palpites:
  - `Na mosca`
  - `Quase crava`
  - `Que azar`
- Bloqueio de resultados preenchidos com botao discreto `Editar`.
- Bloqueio de palpites apos resultado lancado.
- Indicador de sincronizacao:
  - `Sincronizando...`
  - `Salvo`
  - `Erro ao salvar`
  - `Carregando...`
- Botao manual `Sincronizar`.
- Temas:
  - Escuro
  - Brasil
- Sincronizacao com Google Sheets via Apps Script.
- Deploy preparado para GitHub Pages.

## Tecnologias

- HTML
- CSS
- JavaScript modular
- Webpack
- GitHub Pages
- Google Sheets
- Google Apps Script

## Estrutura

```txt
.
|-- css/
|   `-- style.css
|-- google-apps-script/
|   |-- Code.gs
|   `-- README.md
|-- js/
|   |-- app.js
|   |-- core/
|   |   |-- appController.js
|   |   |-- appState.js
|   |   |-- overviewController.js
|   |   |-- predictionsController.js
|   |   |-- scoresController.js
|   |   `-- uiHelpers.js
|   |-- data/
|   |   `-- worldCupData.js
|   |-- renderers/
|   |   |-- heroRenderer.js
|   |   |-- knockoutRenderer.js
|   |   |-- matchesRenderer.js
|   |   |-- predictionsRenderer.js
|   |   |-- resultsRenderer.js
|   |   `-- standingsRenderer.js
|   `-- services/
|       |-- knockoutService.js
|       |-- predictionService.js
|       |-- standingsService.js
|       `-- storageService.js
|-- index.html
|-- webpack.common.js
|-- webpack.config.dev.js
`-- webpack.config.prod.js
```

## Como Rodar Localmente

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm start
```

Gere a versao de producao:

```bash
npm run build
```

## Persistencia

O projeto usa uma camada de persistencia em `js/services/storageService.js`.

Ela suporta dois modos:

### Local

Usa `localStorage` do navegador.

```js
const storageConfig = {
  provider: 'local',
  key: 'copa2026-novo',
  endpoint: ''
};
```

### Google Sheets

Usa Google Apps Script publicado como `App da Web`.

```js
const storageConfig = {
  provider: 'googleSheets',
  key: 'copa2026-novo',
  endpoint: 'URL_DO_APPS_SCRIPT'
};
```

O script do Google Apps Script esta em:

```txt
google-apps-script/Code.gs
```

As instrucoes completas estao em:

```txt
google-apps-script/README.md
```

## Deploy

O projeto possui workflow para GitHub Pages em:

```txt
.github/workflows/static.yml
```

Fluxo recomendado:

```bash
git add .
git commit -m "Atualiza tabela da Copa 2026"
git push
```

Apos o push, o GitHub Pages publica a nova versao automaticamente.

## Observacoes

- O diretorio `dist/` e gerado pelo build e fica ignorado pelo Git.
- O arquivo `google-apps-script/Code.gs` nao roda dentro do navegador; ele deve ser copiado para o Apps Script da planilha.
- O Google Sheets funciona como uma persistencia simples e compartilhada. Para controle avancado de usuarios, permissoes e concorrencia, uma evolucao natural seria Firebase ou Supabase.

## Status

Projeto em evolucao ativa, com foco em:

- Experiencia mobile.
- Sincronizacao confiavel.
- Organizacao modular.
- Facilidade de uso para acompanhar resultados e palpites.
