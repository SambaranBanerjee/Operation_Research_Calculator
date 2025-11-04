export type TransportationMethod = 'northWest' | 'leastCost' | 'vogels';

export interface Allocation {
  row: number;
  col: number;
  amount: number;
}

export const transportationProblem = (
  method?: TransportationMethod,
  cost?: number[][],
  supply?: number[],
  demand?: number[]
): Allocation[] | { prompt: string; methods: { key: TransportationMethod; label: string }[] } | string => {
  if (!method) {
    return {
      prompt: 'Choose a method to solve the Transportation Problem:',
      methods: [
        { key: 'northWest', label: 'North-West Method' },
        { key: 'leastCost', label: 'Least Cost Method' },
        { key: 'vogels', label: "Vogel's Approximation Method" },
      ],
    };
  }

  if (!cost || !supply || !demand) return 'Cost matrix, supply and demand must be provided';

  switch (method) {
    case 'northWest':
      return northWestMethod(cost, supply, demand);
    case 'leastCost':
      return leastCostMethod(cost, supply, demand);
    case 'vogels':
      return vogelsApproximationMethod(cost, supply, demand);
    default:
      return 'Invalid or unknown method';
  }
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
