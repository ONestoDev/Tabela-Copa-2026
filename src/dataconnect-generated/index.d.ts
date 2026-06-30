import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateLeagueData {
  league_insert: League_Key;
}

export interface CreateLeagueVariables {
  name: string;
}

export interface DeletePredictionData {
  prediction_delete?: Prediction_Key | null;
}

export interface DeletePredictionVariables {
  id: UUIDString;
}

export interface LeagueMember_Key {
  userId: UUIDString;
  leagueId: UUIDString;
  __typename?: 'LeagueMember_Key';
}

export interface League_Key {
  id: UUIDString;
  __typename?: 'League_Key';
}

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

export interface Match_Key {
  id: UUIDString;
  __typename?: 'Match_Key';
}

export interface PlacePredictionData {
  prediction_insert: Prediction_Key;
}

export interface PlacePredictionVariables {
  matchId: UUIDString;
  homeScore: number;
  awayScore: number;
}

export interface Prediction_Key {
  id: UUIDString;
  __typename?: 'Prediction_Key';
}

export interface Team_Key {
  id: UUIDString;
  __typename?: 'Team_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateLeagueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLeagueVariables): MutationRef<CreateLeagueData, CreateLeagueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLeagueVariables): MutationRef<CreateLeagueData, CreateLeagueVariables>;
  operationName: string;
}
export const createLeagueRef: CreateLeagueRef;

export function createLeague(vars: CreateLeagueVariables): MutationPromise<CreateLeagueData, CreateLeagueVariables>;
export function createLeague(dc: DataConnect, vars: CreateLeagueVariables): MutationPromise<CreateLeagueData, CreateLeagueVariables>;

interface ListMatchesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListMatchesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListMatchesData, undefined>;
  operationName: string;
}
export const listMatchesRef: ListMatchesRef;

export function listMatches(options?: ExecuteQueryOptions): QueryPromise<ListMatchesData, undefined>;
export function listMatches(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListMatchesData, undefined>;

interface PlacePredictionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: PlacePredictionVariables): MutationRef<PlacePredictionData, PlacePredictionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: PlacePredictionVariables): MutationRef<PlacePredictionData, PlacePredictionVariables>;
  operationName: string;
}
export const placePredictionRef: PlacePredictionRef;

export function placePrediction(vars: PlacePredictionVariables): MutationPromise<PlacePredictionData, PlacePredictionVariables>;
export function placePrediction(dc: DataConnect, vars: PlacePredictionVariables): MutationPromise<PlacePredictionData, PlacePredictionVariables>;

interface DeletePredictionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeletePredictionVariables): MutationRef<DeletePredictionData, DeletePredictionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeletePredictionVariables): MutationRef<DeletePredictionData, DeletePredictionVariables>;
  operationName: string;
}
export const deletePredictionRef: DeletePredictionRef;

export function deletePrediction(vars: DeletePredictionVariables): MutationPromise<DeletePredictionData, DeletePredictionVariables>;
export function deletePrediction(dc: DataConnect, vars: DeletePredictionVariables): MutationPromise<DeletePredictionData, DeletePredictionVariables>;

