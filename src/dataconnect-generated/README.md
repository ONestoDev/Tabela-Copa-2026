# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListMatches*](#listmatches)
- [**Mutations**](#mutations)
  - [*CreateLeague*](#createleague)
  - [*PlacePrediction*](#placeprediction)
  - [*DeletePrediction*](#deleteprediction)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListMatches
You can execute the `ListMatches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listMatches(options?: ExecuteQueryOptions): QueryPromise<ListMatchesData, undefined>;

interface ListMatchesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMatchesData, undefined>;
}
export const listMatchesRef: ListMatchesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMatches(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMatchesData, undefined>;

interface ListMatchesRef {
  ...
  (dc: DataConnect): QueryRef<ListMatchesData, undefined>;
}
export const listMatchesRef: ListMatchesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMatchesRef:
```typescript
const name = listMatchesRef.operationName;
console.log(name);
```

### Variables
The `ListMatches` query has no variables.
### Return Type
Recall that executing the `ListMatches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMatchesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListMatchesData {
  matches: ({
    date: TimestampString;
    stage: string;
    status: string;
    homeTeam: {
      name: string;
    };
    awayTeam: {
      name: string;
    };
  })[];
}
```
### Using `ListMatches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMatches } from '@dataconnect/generated';


// Call the `listMatches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMatches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMatches(dataConnect);

console.log(data.matches);

// Or, you can use the `Promise` API.
listMatches().then((response) => {
  const data = response.data;
  console.log(data.matches);
});
```

### Using `ListMatches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMatchesRef } from '@dataconnect/generated';


// Call the `listMatchesRef()` function to get a reference to the query.
const ref = listMatchesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMatchesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.matches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.matches);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateLeague
You can execute the `CreateLeague` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLeague(vars: CreateLeagueVariables): MutationPromise<CreateLeagueData, CreateLeagueVariables>;

interface CreateLeagueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLeagueVariables): MutationRef<CreateLeagueData, CreateLeagueVariables>;
}
export const createLeagueRef: CreateLeagueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLeague(dc: DataConnect, vars: CreateLeagueVariables): MutationPromise<CreateLeagueData, CreateLeagueVariables>;

interface CreateLeagueRef {
  ...
  (dc: DataConnect, vars: CreateLeagueVariables): MutationRef<CreateLeagueData, CreateLeagueVariables>;
}
export const createLeagueRef: CreateLeagueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLeagueRef:
```typescript
const name = createLeagueRef.operationName;
console.log(name);
```

### Variables
The `CreateLeague` mutation requires an argument of type `CreateLeagueVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateLeagueVariables {
  name: string;
}
```
### Return Type
Recall that executing the `CreateLeague` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLeagueData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLeagueData {
  league_insert: League_Key;
}
```
### Using `CreateLeague`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLeague, CreateLeagueVariables } from '@dataconnect/generated';

// The `CreateLeague` mutation requires an argument of type `CreateLeagueVariables`:
const createLeagueVars: CreateLeagueVariables = {
  name: ..., 
};

// Call the `createLeague()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLeague(createLeagueVars);
// Variables can be defined inline as well.
const { data } = await createLeague({ name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLeague(dataConnect, createLeagueVars);

console.log(data.league_insert);

// Or, you can use the `Promise` API.
createLeague(createLeagueVars).then((response) => {
  const data = response.data;
  console.log(data.league_insert);
});
```

### Using `CreateLeague`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLeagueRef, CreateLeagueVariables } from '@dataconnect/generated';

// The `CreateLeague` mutation requires an argument of type `CreateLeagueVariables`:
const createLeagueVars: CreateLeagueVariables = {
  name: ..., 
};

// Call the `createLeagueRef()` function to get a reference to the mutation.
const ref = createLeagueRef(createLeagueVars);
// Variables can be defined inline as well.
const ref = createLeagueRef({ name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLeagueRef(dataConnect, createLeagueVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.league_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.league_insert);
});
```

## PlacePrediction
You can execute the `PlacePrediction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
placePrediction(vars: PlacePredictionVariables): MutationPromise<PlacePredictionData, PlacePredictionVariables>;

interface PlacePredictionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: PlacePredictionVariables): MutationRef<PlacePredictionData, PlacePredictionVariables>;
}
export const placePredictionRef: PlacePredictionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
placePrediction(dc: DataConnect, vars: PlacePredictionVariables): MutationPromise<PlacePredictionData, PlacePredictionVariables>;

interface PlacePredictionRef {
  ...
  (dc: DataConnect, vars: PlacePredictionVariables): MutationRef<PlacePredictionData, PlacePredictionVariables>;
}
export const placePredictionRef: PlacePredictionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the placePredictionRef:
```typescript
const name = placePredictionRef.operationName;
console.log(name);
```

### Variables
The `PlacePrediction` mutation requires an argument of type `PlacePredictionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface PlacePredictionVariables {
  matchId: UUIDString;
  homeScore: number;
  awayScore: number;
}
```
### Return Type
Recall that executing the `PlacePrediction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `PlacePredictionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface PlacePredictionData {
  prediction_insert: Prediction_Key;
}
```
### Using `PlacePrediction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, placePrediction, PlacePredictionVariables } from '@dataconnect/generated';

// The `PlacePrediction` mutation requires an argument of type `PlacePredictionVariables`:
const placePredictionVars: PlacePredictionVariables = {
  matchId: ..., 
  homeScore: ..., 
  awayScore: ..., 
};

// Call the `placePrediction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await placePrediction(placePredictionVars);
// Variables can be defined inline as well.
const { data } = await placePrediction({ matchId: ..., homeScore: ..., awayScore: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await placePrediction(dataConnect, placePredictionVars);

console.log(data.prediction_insert);

// Or, you can use the `Promise` API.
placePrediction(placePredictionVars).then((response) => {
  const data = response.data;
  console.log(data.prediction_insert);
});
```

### Using `PlacePrediction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, placePredictionRef, PlacePredictionVariables } from '@dataconnect/generated';

// The `PlacePrediction` mutation requires an argument of type `PlacePredictionVariables`:
const placePredictionVars: PlacePredictionVariables = {
  matchId: ..., 
  homeScore: ..., 
  awayScore: ..., 
};

// Call the `placePredictionRef()` function to get a reference to the mutation.
const ref = placePredictionRef(placePredictionVars);
// Variables can be defined inline as well.
const ref = placePredictionRef({ matchId: ..., homeScore: ..., awayScore: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = placePredictionRef(dataConnect, placePredictionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.prediction_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.prediction_insert);
});
```

## DeletePrediction
You can execute the `DeletePrediction` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deletePrediction(vars: DeletePredictionVariables): MutationPromise<DeletePredictionData, DeletePredictionVariables>;

interface DeletePredictionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePredictionVariables): MutationRef<DeletePredictionData, DeletePredictionVariables>;
}
export const deletePredictionRef: DeletePredictionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deletePrediction(dc: DataConnect, vars: DeletePredictionVariables): MutationPromise<DeletePredictionData, DeletePredictionVariables>;

interface DeletePredictionRef {
  ...
  (dc: DataConnect, vars: DeletePredictionVariables): MutationRef<DeletePredictionData, DeletePredictionVariables>;
}
export const deletePredictionRef: DeletePredictionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deletePredictionRef:
```typescript
const name = deletePredictionRef.operationName;
console.log(name);
```

### Variables
The `DeletePrediction` mutation requires an argument of type `DeletePredictionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeletePredictionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeletePrediction` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeletePredictionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeletePredictionData {
  prediction_delete?: Prediction_Key | null;
}
```
### Using `DeletePrediction`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deletePrediction, DeletePredictionVariables } from '@dataconnect/generated';

// The `DeletePrediction` mutation requires an argument of type `DeletePredictionVariables`:
const deletePredictionVars: DeletePredictionVariables = {
  id: ..., 
};

// Call the `deletePrediction()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deletePrediction(deletePredictionVars);
// Variables can be defined inline as well.
const { data } = await deletePrediction({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deletePrediction(dataConnect, deletePredictionVars);

console.log(data.prediction_delete);

// Or, you can use the `Promise` API.
deletePrediction(deletePredictionVars).then((response) => {
  const data = response.data;
  console.log(data.prediction_delete);
});
```

### Using `DeletePrediction`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deletePredictionRef, DeletePredictionVariables } from '@dataconnect/generated';

// The `DeletePrediction` mutation requires an argument of type `DeletePredictionVariables`:
const deletePredictionVars: DeletePredictionVariables = {
  id: ..., 
};

// Call the `deletePredictionRef()` function to get a reference to the mutation.
const ref = deletePredictionRef(deletePredictionVars);
// Variables can be defined inline as well.
const ref = deletePredictionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deletePredictionRef(dataConnect, deletePredictionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.prediction_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.prediction_delete);
});
```

