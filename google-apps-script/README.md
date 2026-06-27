# Google Sheets Storage

Este diretório contém o script para sincronizar os dados da Copa 2026 com uma planilha Google.

## Passo a passo

1. Crie uma planilha no Google Sheets.
2. Na planilha, acesse `Extensoes > Apps Script`.
3. Apague o conteudo padrão do editor e cole o conteudo de `Code.gs`.
4. Salve o projeto.
5. Clique em `Implantar > Nova implantacao`.
6. Escolha o tipo `App da Web`.
7. Configure:
   - Executar como: `Eu`
   - Quem pode acessar: `Qualquer pessoa`
8. Clique em `Implantar`.
9. Copie a URL terminada em `/exec`.
10. No arquivo `js/app.js`, altere:

```js
const storageConfig = {
  provider: 'googleSheets',
  key: 'copa2026-novo',
  endpoint: 'COLE_A_URL_DO_APPS_SCRIPT_AQUI'
};
```

Enquanto `provider` estiver como `local`, o app continua usando apenas o navegador atual.
