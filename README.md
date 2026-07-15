# 🏆 Tabela Copa 2026

Aplicação web desenvolvida para acompanhar a **Copa do Mundo FIFA 2026**, permitindo registrar resultados, acompanhar a classificação da fase de grupos, visualizar o mata-mata e gerenciar palpites dos participantes.

O projeto foi desenvolvido utilizando **JavaScript modular**, com foco em organização de código, separação de responsabilidades e facilidade de manutenção.

---

## ✨ Funcionalidades

* ⚽ Cadastro e edição de resultados das partidas
* 📊 Classificação automática da fase de grupos
* 🏅 Ranking dos melhores terceiros colocados
* 🏆 Geração automática do mata-mata
* 🎯 Sistema de palpites por participante
* 📈 Ranking de pontuação dos palpites
* 💾 Persistência de dados com LocalStorage
* ☁️ Sincronização opcional com Google Sheets
* 🌙 Tema escuro
* 🇧🇷 Tema Brasil
* 📱 Interface responsiva

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript (ES6+)
* Webpack
* GitHub Pages
* Google Apps Script
* Google Sheets

---

## 📂 Estrutura do Projeto

```text
.
├── css/
├── google-apps-script/
├── js/
│   ├── core/
│   ├── data/
│   ├── renderers/
│   └── services/
├── index.html
├── package.json
└── webpack/
```

---

## 🚀 Como executar o projeto

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

### Execute em modo de desenvolvimento

```bash
npm start
```

### Gere a versão de produção

```bash
npm run build
```

### Configure a chave da API-Football

A chave da API-Football nao deve ficar em arquivos do frontend. Configure-a em
`GitHub > Settings > Secrets and variables > Actions` com o nome:

```text
FOOTBALL_API_KEY
```

O workflow `.github/workflows/static.yml` roda o script `npm run stats:update`,
gera `js/data/apiStats.json`, faz commit quando os dados mudam e publica o site
no GitHub Pages. O limite do script e de 50 chamadas por dia.

---

## 💾 Persistência de Dados

O projeto oferece duas formas de armazenamento:

### LocalStorage

Ideal para utilização local durante o desenvolvimento.

### Google Sheets

Permite compartilhar os dados entre vários usuários através de uma planilha do Google integrada via Google Apps Script.

As instruções para configuração estão disponíveis na pasta:

```text
google-apps-script/
```

---

## 🌐 Deploy

O projeto está preparado para publicação utilizando o **GitHub Pages**.

Após realizar alterações, basta executar:

```bash
git add .
git commit -m "Descrição da alteração"
git push
```

---

## 📌 Roadmap

* [x] Fase de grupos
* [x] Classificação automática
* [x] Mata-mata
* [x] Sistema de palpites
* [x] Ranking de participantes
* [x] Tema escuro
* [x] Integração com Google Sheets
* [ ] Estatísticas dos participantes
* [ ] Melhorias na experiência mobile
* [ ] Painel administrativo

---

## 📚 Aprendizados

Durante o desenvolvimento deste projeto foram aplicados conceitos como:

* Organização de projetos JavaScript em módulos
* Separação de responsabilidades
* Manipulação do DOM
* Persistência de dados
* Integração com Google Apps Script
* Configuração do Webpack
* Publicação utilizando GitHub Pages

---

## 👨‍💻 Autor

Desenvolvido por **ONestoDev**.

Se este projeto foi útil ou serviu de inspiração, considere deixar uma ⭐ no repositório.

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT.
