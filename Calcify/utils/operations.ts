import type { TransportationMethod } from "./transportation";
import { transportationProblem } from "./transportation";

export const operations = {
  transportationProblem: (
    method?: TransportationMethod,
    cost?: number[][],
    supply?: number[],
    demand?: number[]
  ) => {
      return transportationProblem(method, cost, supply, demand);
  },
  linearProgrammingProblem: () => {
    return 'Return of Linear Programming Problem';
  },
  assignmentProblem: () => {
    return 'Return of Assignment Problem';
  },
  networkFlowProblem: () => {
    return 'Return of Network Flow Problem';
  }
}