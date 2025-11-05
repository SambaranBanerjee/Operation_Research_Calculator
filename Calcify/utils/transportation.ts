export type TransportationMethod = 'northWest' | 'leastCost' | 'vogels' | 'modi';

export interface Allocation {
  row: number;
  col: number;
  amount: number;
}

export interface Solution {
  allocation: Allocation[];
  totalCost: number;
  iterations?: MODIIteration[]; // Added for MODI method
  optimal?: boolean; // Added for MODI method
}

export interface MODIIteration {
  allocation: Allocation[];
  u: number[];
  v: number[];
  reducedCosts: number[][];
  enteringCell?: { row: number; col: number };
  theta?: number;
  totalCost: number;
}

function calculateTotalCost(allocation: Allocation[], cost: number[][]): number {
  return allocation.reduce((sum, alloc) => sum + alloc.amount * cost[alloc.row][alloc.col], 0);
}

export const transportationProblem = (
  method?: TransportationMethod,
  cost?: number[][],
  supply?: number[],
  demand?: number[]
): Solution | { prompt: string; methods: { key: TransportationMethod; label: string }[] } | string => {
  if (!method) {
    return {
      prompt: 'Choose a method to solve the Transportation Problem:',
      methods: [
        { key: 'northWest', label: 'North-West Method' },
        { key: 'leastCost', label: 'Least Cost Method' },
        { key: 'vogels', label: "Vogel's Approximation Method" },
        { key: 'modi', label: 'MODI Method (Optimal Solution)' },
      ],
    };
  }

  if (!cost || !supply || !demand) return 'Cost matrix, supply and demand must be provided';

  let solution: Solution;

  switch (method) {
    case 'northWest':
      const nwAllocation = northWestMethod(cost, supply, demand);
      solution = {
        allocation: nwAllocation,
        totalCost: calculateTotalCost(nwAllocation, cost)
      };
      break;
    case 'leastCost':
      const lcAllocation = leastCostMethod(cost, supply, demand);
      solution = {
        allocation: lcAllocation,
        totalCost: calculateTotalCost(lcAllocation, cost)
      };
      break;
    case 'vogels':
      const vogelsAllocation = vogelsApproximationMethod(cost, supply, demand);
      solution = {
        allocation: vogelsAllocation,
        totalCost: calculateTotalCost(vogelsAllocation, cost)
      };
      break;
    case 'modi':
      const modiSolution = modiMethod(cost, supply, demand);
      solution = modiSolution;
      break;
    default:
      return 'Invalid or unknown method';
  }

  return solution;
};

function cloneArray<T>(arr: T[]): T[] {
  return arr.slice();
}

function northWestMethod(cost: number[][], supply: number[], demand: number[]): Allocation[] {
  const allocation: Allocation[] = [];
  const s = cloneArray(supply);
  const d = cloneArray(demand);
  let i = 0, j = 0;

  while (i < s.length && j < d.length) {
    const qty = Math.min(s[i], d[j]);
    allocation.push({ row: i, col: j, amount: qty });
    s[i] -= qty;
    d[j] -= qty;

    if (s[i] === 0) i++;
    if (d[j] === 0) j++;
  }

  return allocation;
}

function leastCostMethod(cost: number[][], supply: number[], demand: number[]): Allocation[] {
  const allocation: Allocation[] = [];
  const s = cloneArray(supply);
  const d = cloneArray(demand);
  const rows = s.length;
  const cols = d.length;

  const allocated = Array(rows).fill(null).map(() => Array(cols).fill(false));

  while (true) {
    let minCost = Infinity;
    let minCell: { i: number; j: number } | null = null;

    for (let i = 0; i < rows; i++) {
      if (s[i] === 0) continue;
      for (let j = 0; j < cols; j++) {
        if (d[j] === 0) continue;
        if (!allocated[i][j] && cost[i][j] < minCost) {
          minCost = cost[i][j];
          minCell = { i, j };
        }
      }
    }

    if (minCell === null) break;

    const { i, j } = minCell;
    const qty = Math.min(s[i], d[j]);
    allocation.push({ row: i, col: j, amount: qty });
    s[i] -= qty;
    d[j] -= qty;

    if (s[i] === 0) {
      for (let c = 0; c < cols; c++) allocated[i][c] = true;
    }
    if (d[j] === 0) {
      for (let r = 0; r < rows; r++) allocated[r][j] = true;
    }
  }

  return allocation;
}

function vogelsApproximationMethod(cost: number[][], supply: number[], demand: number[]): Allocation[] {
  const allocation: Allocation[] = [];
  const s = cloneArray(supply);
  const d = cloneArray(demand);
  const rows = s.length;
  const cols = d.length;

  const rowDone = Array(rows).fill(false);
  const colDone = Array(cols).fill(false);

  while (rowDone.some(done => !done) && colDone.some(done => !done)) {
    const rowPenalties = rowDone.map((done, i) => {
      if (done) return -1;
      const costs = cost[i].map((c, j) => colDone[j] ? Infinity : c).filter(c => c !== Infinity).sort((a, b) => a - b);
      return costs.length > 1 ? costs[1] - costs[0] : costs[0];
    });

    const colPenalties = colDone.map((done, j) => {
      if (done) return -1;
      const costs = [];
      for (let i = 0; i < rows; i++) {
        if (!rowDone[i]) costs.push(cost[i][j]);
      }
      costs.sort((a, b) => a - b);
      return costs.length > 1 ? costs[1] - costs[0] : costs[0];
    });

    const maxRowPenalty = Math.max(...rowPenalties);
    const maxColPenalty = Math.max(...colPenalties);

    if(maxRowPenalty >= maxColPenalty) {
      const rowIndex = rowPenalties.findIndex(p => p === maxRowPenalty);
      const availableCols = [];
      for (let j = 0; j < cols; j++) {
        if (!colDone[j]) availableCols.push({ col: j, cost: cost[rowIndex][j] });
      }
      availableCols.sort((a, b) => a.cost - b.cost);
      const minCol = availableCols[0].col;
      const qty = Math.min(s[rowIndex], d[minCol]);
      allocation.push({ row: rowIndex, col: minCol, amount: qty });
      s[rowIndex] -= qty;
      d[minCol] -= qty;
      if(s[rowIndex] === 0) rowDone[rowIndex] = true;
      if(d[minCol] === 0) colDone[minCol] = true;
    } else {
      const colIndex = colPenalties.findIndex(p => p === maxColPenalty);
      const availableRows = [];
      for(let i = 0; i < rows; i++) {
        if(!rowDone[i]) availableRows.push({ row: i, cost: cost[i][colIndex] });
      }
      availableRows.sort((a,b) => a.cost - b.cost);
      const minRow = availableRows[0].row;
      const qty = Math.min(s[minRow], d[colIndex]);
      allocation.push({row: minRow, col: colIndex, amount: qty});
      s[minRow] -= qty;
      d[colIndex] -= qty;
      if(s[minRow] === 0) rowDone[minRow] = true;
      if(d[colIndex] === 0) colDone[colIndex] = true;
    }
  }

  return allocation;
}

// MODI Method Implementation
function modiMethod(cost: number[][], supply: number[], demand: number[]): Solution {
  const iterations: MODIIteration[] = [];
  
  // Start with Vogel's approximation for a good initial solution
  let currentAllocation = vogelsApproximationMethod(cost, supply, demand);
  let iterationCount = 0;
  const maxIterations = 100; // Prevent infinite loops

  while (iterationCount < maxIterations) {
    // Step 1: Calculate u and v values
    const { u, v } = calculateUVValues(currentAllocation, cost, supply.length, demand.length);
    
    // Step 2: Calculate reduced costs for all non-basic cells
    const reducedCosts = calculateReducedCosts(cost, u, v, supply.length, demand.length);
    
    // Step 3: Check for optimality (all reduced costs >= 0)
    const { hasNegative, enteringCell } = findEnteringCell(reducedCosts, currentAllocation);
    
    const currentIteration: MODIIteration = {
      allocation: [...currentAllocation],
      u: [...u],
      v: [...v],
      reducedCosts: reducedCosts.map(row => [...row]),
      totalCost: calculateTotalCost(currentAllocation, cost)
    };

    if (hasNegative && enteringCell) {
      currentIteration.enteringCell = enteringCell;
      
      // Step 4: Find the loop and determine theta
      const loop = findLoop(currentAllocation, enteringCell.row, enteringCell.col);
      const theta = findTheta(currentAllocation, loop);
      currentIteration.theta = theta;
      
      // Step 5: Update allocation
      currentAllocation = updateAllocation(currentAllocation, loop, theta);
    } else {
      // Optimal solution found
      currentIteration.enteringCell = undefined;
      iterations.push(currentIteration);
      return {
        allocation: currentAllocation,
        totalCost: calculateTotalCost(currentAllocation, cost),
        iterations,
        optimal: true
      };
    }

    iterations.push(currentIteration);
    iterationCount++;
  }

  return {
    allocation: currentAllocation,
    totalCost: calculateTotalCost(currentAllocation, cost),
    iterations,
    optimal: false
  };
}

function calculateUVValues(
  allocation: Allocation[], 
  cost: number[][], 
  rows: number, 
  cols: number
): { u: number[]; v: number[] } {
  const u: number[] = Array(rows).fill(Number.NaN);
  const v: number[] = Array(cols).fill(Number.NaN);
  
  // Set u[0] = 0 and solve for others
  u[0] = 0;
  let changed = true;
  
  while (changed) {
    changed = false;
    
    for (const alloc of allocation) {
      const { row, col, amount } = alloc;
      if (amount > 0) { // Basic cell
        if (!isNaN(u[row]) && isNaN(v[col])) {
          v[col] = cost[row][col] - u[row];
          changed = true;
        } else if (isNaN(u[row]) && !isNaN(v[col])) {
          u[row] = cost[row][col] - v[col];
          changed = true;
        }
      }
    }
  }
  
  return { u, v };
}

function calculateReducedCosts(
  cost: number[][], 
  u: number[], 
  v: number[], 
  rows: number, 
  cols: number
): number[][] {
  const reducedCosts: number[][] = [];
  
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) {
      // Reduced cost = c_ij - u_i - v_j
      row.push(cost[i][j] - u[i] - v[j]);
    }
    reducedCosts.push(row);
  }
  
  return reducedCosts;
}

function findEnteringCell(
  reducedCosts: number[][], 
  allocation: Allocation[]
): { hasNegative: boolean; enteringCell?: { row: number; col: number } } {
  let minReducedCost = 0;
  let enteringCell: { row: number; col: number } | undefined;
  
  // Create a set of basic cells for quick lookup
  const basicCells = new Set();
  for (const alloc of allocation) {
    if (alloc.amount > 0) {
      basicCells.add(`${alloc.row},${alloc.col}`);
    }
  }
  
  // Find the most negative reduced cost among non-basic cells
  for (let i = 0; i < reducedCosts.length; i++) {
    for (let j = 0; j < reducedCosts[i].length; j++) {
      if (!basicCells.has(`${i},${j}`) && reducedCosts[i][j] < minReducedCost) {
        minReducedCost = reducedCosts[i][j];
        enteringCell = { row: i, col: j };
      }
    }
  }
  
  return {
    hasNegative: minReducedCost < 0,
    enteringCell
  };
}

function findLoop(
  allocation: Allocation[], 
  startRow: number, 
  startCol: number
): { row: number; col: number; type: 'plus' | 'minus' }[] {
  // This is a simplified implementation
  // In a full implementation, you would need to find the complete loop
  // using graph traversal algorithms
  
  const loop: { row: number; col: number; type: 'plus' | 'minus' }[] = [];
  
  // Add the starting cell as plus
  loop.push({ row: startRow, col: startCol, type: 'plus' });
  
  // Simplified: find basic cells in the same row and column
  // This is a placeholder - a complete implementation would be more complex
  const basicCells = allocation.filter(alloc => alloc.amount > 0);
  
  // Find a cell in the same row
  const sameRow = basicCells.find(alloc => alloc.row === startRow && alloc.col !== startCol);
  if (sameRow) {
    loop.push({ row: sameRow.row, col: sameRow.col, type: 'minus' });
    
    // Find a cell in the same column as the second cell
    const sameCol = basicCells.find(alloc => alloc.col === sameRow.col && alloc.row !== sameRow.row);
    if (sameCol) {
      loop.push({ row: sameCol.row, col: sameCol.col, type: 'plus' });
      
      // Close the loop
      const closingCell = basicCells.find(alloc => alloc.row === sameCol.row && alloc.col === startCol);
      if (closingCell) {
        loop.push({ row: closingCell.row, col: closingCell.col, type: 'minus' });
      }
    }
  }
  
  return loop;
}

function findTheta(allocation: Allocation[], loop: { row: number; col: number; type: 'plus' | 'minus' }[]): number {
  let theta = Infinity;
  
  // Find the minimum amount in the minus cells of the loop
  for (const cell of loop) {
    if (cell.type === 'minus') {
      const alloc = allocation.find(a => a.row === cell.row && a.col === cell.col);
      if (alloc && alloc.amount < theta) {
        theta = alloc.amount;
      }
    }
  }
  
  return theta === Infinity ? 0 : theta;
}

function updateAllocation(
  allocation: Allocation[], 
  loop: { row: number; col: number; type: 'plus' | 'minus' }[], 
  theta: number
): Allocation[] {
  const newAllocation = allocation.map(alloc => ({ ...alloc }));
  
  for (const cell of loop) {
    const index = newAllocation.findIndex(a => a.row === cell.row && a.col === cell.col);
    
    if (index !== -1) {
      if (cell.type === 'plus') {
        newAllocation[index].amount += theta;
      } else {
        newAllocation[index].amount -= theta;
        
        // Remove cell if amount becomes zero
        if (newAllocation[index].amount === 0) {
          newAllocation.splice(index, 1);
        }
      }
    } else if (cell.type === 'plus') {
      // Add new basic cell
      newAllocation.push({ row: cell.row, col: cell.col, amount: theta });
    }
  }
  
  return newAllocation;
}