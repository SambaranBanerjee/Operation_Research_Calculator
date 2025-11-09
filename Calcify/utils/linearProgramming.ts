// utils/linearProgramming.ts

const EPSILON = 1e-9;

// Input types
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
      error: "Graphical method supports only 2 variables. Please use Simplex for >2 variables.",
    };
  }

  // Include non-negativity constraints
  const allConstraints = [...input.constraints];
  allConstraints.push({ coeffs: [1, 0], type: ">=", rhs: 0 }); // x ≥ 0
  allConstraints.push({ coeffs: [0, 1], type: ">=", rhs: 0 }); // y ≥ 0

  // Find intersection points
  const intersections: number[][] = [];
  for (let i = 0; i < allConstraints.length; i++) {
    for (let j = i + 1; j < allConstraints.length; j++) {
      const p = findIntersection(allConstraints[i], allConstraints[j]);
      if (p) intersections.push(p);
    }
  }

  // Filter feasible points
  const feasiblePoints = intersections.filter((p) =>
    allConstraints.every((c) => {
      const val = c.coeffs[0] * p[0] + c.coeffs[1] * p[1];
      if (c.type === "<=" && val > c.rhs + EPSILON) return false;
      if (c.type === ">=" && val < c.rhs - EPSILON) return false;
      if (c.type === "=" && Math.abs(val - c.rhs) > EPSILON) return false;
      return true;
    })
  );

  if (feasiblePoints.length === 0) {
    return { error: "No feasible region found." };
  }

  const { objective, maximize } = input;
  const evaluated = feasiblePoints.map((p) => ({
    point: p,
    value: objective[0] * p[0] + objective[1] * p[1],
  }));

  const best = maximize
    ? evaluated.reduce((a, b) => (b.value > a.value ? b : a))
    : evaluated.reduce((a, b) => (b.value < a.value ? b : a));

  //  Prepare graph data (for React charting, e.g. Recharts/Chart.js)
  const constraintLines = allConstraints.map((c) => getLinePoints(c));
  const feasiblePolygon = getConvexHull(feasiblePoints);

  return {
    method: "Graphical Method",
    feasiblePoints: evaluated,
    bestSolution: best,
    objectiveType: maximize ? "Maximization" : "Minimization",
    plotData: {
      constraintLines,
      feasibleRegion: feasiblePolygon,
      optimalPoint: best.point,
    },
  };
}

function findIntersection(c1: LPConstraint, c2: LPConstraint): number[] | null {
  const [a, b] = c1.coeffs;
  const [d, e] = c2.coeffs;
  const c = c1.rhs;
  const f = c2.rhs;

  const det = a * e - b * d;
  if (Math.abs(det) < EPSILON) return null; // Parallel lines

  const x = (c * e - b * f) / det;
  const y = (a * f - c * d) / det;
  return [x, y];
}

function getLinePoints(c: LPConstraint, range = [0, 20]) {
  const [a, b] = c.coeffs;
  const points: { x: number; y: number }[] = [];

  // If b != 0, solve for y
  for (let x = range[0]; x <= range[1]; x += 0.5) {
    const y = (c.rhs - a * x) / b;
    if (!isNaN(y)) points.push({ x, y });
  }
  return { constraint: `${a}x + ${b}y ${c.type} ${c.rhs}`, points };
}

function getConvexHull(points: number[][]): { x: number; y: number }[] {
  if (points.length <= 1) return points.map(([x, y]) => ({ x, y }));

  // Sort by x then y
  const sorted = [...points].sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

  const cross = (o: number[], a: number[], b: number[]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lower: number[][] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
      lower.pop();
    lower.push(p);
  }

  const upper: number[][] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
      upper.pop();
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return [...lower, ...upper].map(([x, y]) => ({ x, y }));
}
