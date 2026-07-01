# Firebase Firestore Storage

Este projeto pode usar o Firebase Firestore como banco de dados gratuito para sincronizar placares, palpites e usuarios entre navegadores.

Enquanto `js/app.js` estiver com os valores `COLE_AQUI_*`, o app continua funcionando com `localStorage`. Depois de preencher a configuracao do Firebase, o botao `Sincronizar` e os salvamentos automaticos passam a usar o Firestore.

## Criar o projeto

1. Acesse o Console do Firebase.
2. Crie um projeto.
3. Adicione um app Web.
4. Copie o objeto `firebaseConfig`.
5. No arquivo `js/app.js`, substitua os valores de:

```js
firebaseConfig: {
  apiKey: 'COLE_AQUI_API_KEY',
  authDomain: 'COLE_AQUI_PROJECT_ID.firebaseapp.com',
  projectId: 'COLE_AQUI_PROJECT_ID',
  storageBucket: 'COLE_AQUI_PROJECT_ID.appspot.com',
  messagingSenderId: 'COLE_AQUI_MESSAGING_SENDER_ID',
  appId: 'COLE_AQUI_APP_ID'
}
```

## Criar o Firestore

1. No Firebase, abra `Firestore Database`.
2. Clique em `Create database`.
3. Escolha uma regiao.
4. Inicie em modo de producao.
5. Publique regras de acesso.

## Regras simples para teste

Estas regras permitem que qualquer visitante leia e grave apenas o documento usado pelo app. Use para validar a integracao rapidamente.

O mesmo conteudo esta disponivel em `firebase-firestore/firestore.rules`.

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /copa2026Storage/shared-state {
      allow read, write: if true;
    }
  }
}
```

## Regras melhores para uso real

Para um site publico, o ideal e separar permissoes:

- leitura publica para todos;
- escrita autenticada para administradores;
- palpites gravados por usuario autenticado.

A estrutura atual grava tudo em um documento compartilhado para manter compatibilidade com o app existente. Isso funciona para grupos pequenos, mas nao e a melhor modelagem para muitos usuarios editando ao mesmo tempo.

Um primeiro modelo para quando a autenticacao estiver ativa esta em `firebase-firestore/firestore.production.rules`. Ele mantem leitura publica e exige um usuario autenticado com claim `admin` para escrever no documento compartilhado.

Para a evolucao com varios campeonatos, use como referencia `firebase-firestore/firestore.multi-tournament.rules`. Esse arquivo considera a estrutura futura documentada em `docs/architecture.md`, com dados separados por campeonato, temporada, placares oficiais, palpites por usuario e rankings.

Nao publique `firestore.production.rules` nem `firestore.multi-tournament.rules` no Firebase enquanto o app ainda estiver usando o documento unico `copa2026Storage/shared-state`, porque isso bloquearia os salvamentos atuais.

## Onde os dados ficam

Por padrao, o app grava em:

```txt
collection: copa2026Storage
document: shared-state
```

O documento recebe:

```js
{
  key: 'copa2026-novo',
  state: { ...estadoCompletoDoApp },
  updatedAt: 123456789
}
```
