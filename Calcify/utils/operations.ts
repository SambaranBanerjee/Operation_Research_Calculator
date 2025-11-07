import type { TransportationMethod } from "./transportation";
import { transportationProblem } from "./transportation";
import { solveSimplex, solveGraphical, LPInput } from "./linearProgramming";

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
          { key: "simplex", label: "Simplex Method" },
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
    return solveSimplex(input);
  },

  assignmentProblem: () => "Return of Assignment Problem",

  networkFlowProblem: () => "Return of Network Flow Problem",
};
