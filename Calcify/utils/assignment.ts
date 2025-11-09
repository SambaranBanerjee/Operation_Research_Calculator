// First we check if the number of sources is equal to the number
// of destinations (A = J)

//If the it is not equal we need to add dummy sources or destinations

//Then we start the Hungarian Algorithm
//We first select the smallest element in each row and subtract it from
//all the elements of the row

//Then we select the smallest element in each column and subtract it
//from all the elements of the column

//Then we cover all the zeros in the matrix using a minimum number of horizontal
//and vertical lines

//If the number of lines is equal to the number of rows or columns, an
//optimal assignment is possible among the zeros. If not, we need to
//adjust the matrix and repeat the process

//If the number of lines is greater than the number of rows or columns,
//an optimal assignment is not possible among the zeros. We need to
//make the matrix such that each row and column has at least and at
// most one zero

//If the number of lines is not equal then, we find the smallest values
//from the matrix that is not covered by any line. We subtract this value
//from all the uncovered elements and add it to the elements that are
//intersected by two lines. We then repeat the process of covering the
//zeros until we can make an optimal assignment

//Then finally, we add the values of the assigned places
//this is the minimum cost.

// assignment.ts
/**
 * The Assignment Problem (Hungarian Algorithm)
 * --------------------------------------------
 * Steps:
 * 1. Check if the number of agents (sources) equals the number of tasks (destinations).
 *    - If not equal, add dummy rows or columns (filled with zeros) to make the matrix square.
 *
 * 2. Initialize label arrays (u, v) and matching arrays (p, way).
 *
 * 3. For each agent i:
 *    - Find the minimal reduced cost to build an optimal matching incrementally.
 *    - Use potentials (u, v) to maintain reduced costs.
 *    - Perform augmenting path updates until we find a full matching.
 *
 * 4. After all iterations, reconstruct the optimal assignment.
 *
 * 5. Compute total minimal cost using the original cost matrix (ignoring dummy rows/columns).
 *
 * 6. If every original agent is assigned to a real task (not a dummy), mark as a perfect assignment.
 */

export type AssignmentResult = {
  assignment: number[]; // assignment[row] = col (0-based). -1 if row assigned to dummy
  totalCost: number;
  isPerfect: boolean; // true if every original row got a real column (i.e., not dummy)
};

export function assignmentProblem(
  numAgents: number,
  numTasks: number,
  costMatrix: number[][]
): AssignmentResult {
  if (!Array.isArray(costMatrix) || costMatrix.length === 0)
    throw new Error("costMatrix must be a non-empty 2D array.");

  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  const n = Math.max(rows, cols); // ensure square matrix

  // Step 1: Create padded square matrix (1-based indexing for simplicity)
  const a: number[][] = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i < rows; i++) {
    if (!Array.isArray(costMatrix[i]) || costMatrix[i].length !== cols)
      throw new Error("All rows in costMatrix must have the same length.");
    for (let j = 0; j < cols; j++) {
      const v = costMatrix[i][j];
      if (!isFinite(v)) throw new Error("All costs must be finite numbers.");
      a[i + 1][j + 1] = v;
    }
  }

  // Step 2: Initialize potentials and matching arrays
  const INF = Number.POSITIVE_INFINITY;
  const u = new Array(n + 1).fill(0); // potentials for rows
  const v = new Array(n + 1).fill(0); // potentials for columns
  const p = new Array(n + 1).fill(0); // p[j] = i assigned to j
  const way = new Array(n + 1).fill(0); // way[j] = previous column

  // Step 3: Hungarian algorithm core
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(n + 1).fill(INF);
    const used = new Array(n + 1).fill(false);

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = INF;
      let j1 = 0;

      for (let j = 1; j <= n; j++) {
        if (used[j]) continue;
        const cur = a[i0][j] - u[i0] - v[j];
        if (cur < minv[j]) {
          minv[j] = cur;
          way[j] = j0;
        }
        if (minv[j] < delta) {
          delta = minv[j];
          j1 = j;
        }
      }

      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }

      j0 = j1;
    } while (p[j0] !== 0);

    // Step 4: Augmenting path reconstruction
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  // Step 5: Extract assignment from p[]
  const assignment: number[] = new Array(rows).fill(-1);
  for (let j = 1; j <= n; j++) {
    const i = p[j];
    if (i >= 1 && i <= rows && j >= 1 && j <= cols) {
      assignment[i - 1] = j - 1; // convert to 0-based indices
    }
  }

  // Step 6: Compute total cost for original matrix
  let totalCost = 0;
  let assignedCount = 0;
  for (let i = 0; i < rows; i++) {
    const col = assignment[i];
    if (col >= 0) {
      totalCost += costMatrix[i][col];
      assignedCount++;
    }
  }

  // Step 7: Return results
  return {
    assignment,
    totalCost,
    isPerfect: assignedCount === rows && rows <= cols,
  };
}
