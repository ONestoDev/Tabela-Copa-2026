# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createLeague, listMatches, placePrediction, deletePrediction } from '@dataconnect/generated';


// Operation CreateLeague:  For variables, look at type CreateLeagueVars in ../index.d.ts
const { data } = await CreateLeague(dataConnect, createLeagueVars);

// Operation ListMatches: 
const { data } = await ListMatches(dataConnect);

// Operation PlacePrediction:  For variables, look at type PlacePredictionVars in ../index.d.ts
const { data } = await PlacePrediction(dataConnect, placePredictionVars);

// Operation DeletePrediction:  For variables, look at type DeletePredictionVars in ../index.d.ts
const { data } = await DeletePrediction(dataConnect, deletePredictionVars);


```