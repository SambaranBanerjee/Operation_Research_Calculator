// utils/linearProgramming.ts
// Right now, this file has the mock implementations of the LP solving methods.
// In the future we have to replace these with real implementations or integrate with an LP solver library.

// Defining the input types
export interface LPConstraint {
  coeffs: number[];
  type: "<=" | ">=" | "=";
  rhs: number;
}

export interface LPInput {
  numVars: number;
  objective: number[];
  maximize: boolean;
  constraints: LPConstraint[];
}

export function solveGraphical(input: LPInput) {
  if (input.numVars > 2) {
    return {
      error: "Graphical method supports only 2 variables. Please use Simplex.",
    };
  }

  const { objective, constraints, maximize } = input;

  // The feasible points (intersections)
  const feasiblePoints = [
    [0, 0],
    [constraints[0]?.rhs / (constraints[0]?.coeffs[0] || 1), 0],
    [0, constraints[1]?.rhs / (constraints[1]?.coeffs[1] || 1)],
  ];

  // Computing the objective value at each feasible point
  const evaluations = feasiblePoints.map((p) => ({
    point: p,
    value: objective[0] * p[0] + objective[1] * p[1],
  }));

  // Choosing the best point
  const best = maximize
    ? evaluations.reduce((a, b) => (b.value > a.value ? b : a))
    : evaluations.reduce((a, b) => (b.value < a.value ? b : a));

  return {
    method: "Graphical Method",
    feasiblePoints: evaluations,
    bestSolution: best,
    objectiveType: maximize ? "Maximization" : "Minimization",
  };
}

export function solveSimplex(input: LPInput) {
  const { numVars, objective, maximize, constraints } = input;

  // Fake “optimization” just for demonstration
  const fakeSolution = objective.map((_, i) => i + 1); // e.g. x1=1, x2=2, ...
  const fakeValue = objective.reduce(
    (sum, c, i) => sum + c * fakeSolution[i],
    0
  );

  return {
    method: "Simplex Method",
    numVariables: numVars,
    constraints,
    solution: fakeSolution.map((val, i) => ({
      variable: `x${i + 1}`,
      value: val,
    })),
    objectiveValue: maximize ? fakeValue : -fakeValue,
    objectiveType: maximize ? "Maximization" : "Minimization",
    note:
      "This is a mock simplex solver for UI testing. Replace with a real LP engine later.",
  };
}
