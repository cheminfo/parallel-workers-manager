export function getMatrixSum(matrix) {
  let sum = 0;
  for (let row of matrix) {
    for (let value of row) {
      sum += value;
    }
  }
  return sum;
}
