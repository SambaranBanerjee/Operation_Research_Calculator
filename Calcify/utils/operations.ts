import type { TransportationMethod } from "./transportation";
import { transportationProblem } from "./transportation";
import { solveGraphical, LPInput } from "./linearProgramming";
import { assignmentProblem } from "./assignment";
import { networkFlow } from "./networkFlow";

export const operations = {
  transportationProblem: (
    method?: TransportationMethod,
    cost?: number[][],
    supply?: number[],
    demand?: number[]
  ) => {
    return transportationProblem(method, cost, supply, demand);
  },

  linearProgrammingProblem: (
    method?: string,
    numVars?: number,
    objective?: number[],
    maximize?: boolean,
    constraints?: { coeffs: number[]; type: "<=" | ">=" | "="; rhs: number }[]
  ) => {
    if (!numVars || !objective) {
      return {
        prompt: "Choose a method to solve the Linear Programming Problem:",
        methods: [
          { key: "graph", label: "Graphical Method (2 vars only)" },
        ],
      };
    }

    const input: LPInput = {
      numVars,
      objective,
      maximize: Boolean(maximize),
      constraints: constraints || [],
    };

    // Deciding the method
    if (method === "graph") return solveGraphical(input);
  },

  assignmentProblem: (
    numAgents?: number,
    numTasks?: number,
    costMatrix?: number[][]
  ) => {
    if (!costMatrix) {
      return {
        prompt: "Enter the cost matrix for the Assignment Problem:",
        methods: [{ key: "assignment", label: "Hungarian Method" }],
      };
    }

    return assignmentProblem(numAgents ?? 0, numTasks ?? 0, costMatrix);
  },

  networkFlowProblem: (activities?: { activity: string; predecessors: string[] }[]) => {
    if (!activities) {
      return {
        prompt: "Enter the list of activities and their predecessors:",
        methods: [{ key: "network", label: "Activity Precedence Method" }],
      };
    }
    return networkFlow(activities);
  },
};
