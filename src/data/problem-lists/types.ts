export interface ListProblem {
  id: string;
  title: string;
  url: string;
  difficultyScore?: number;
  premium?: boolean;
  optional?: boolean;
}

export interface ProblemListSection {
  id: string;
  title: string;
  optional?: boolean;
  sections?: ProblemListSection[];
  problems?: ListProblem[];
}

export interface ProblemList {
  id: string;
  title: string;
  author: string;
  sourceUrl: string;
  description: string;
  sections: ProblemListSection[];
  initialCompleted: string[];
}

export type ProblemListSummary = Pick<
  ProblemList,
  'id' | 'title' | 'author' | 'sourceUrl' | 'description' | 'initialCompleted'
> & {
  problems: Pick<ListProblem, 'id' | 'title' | 'difficultyScore'>[];
};
