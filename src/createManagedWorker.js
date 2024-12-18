export function createManagedWorkerString(code) {
  const wrapped = `
   addEventListener('message', (e) => {
    exec(e.data);
});
  async function exec(data) {
    const result = await (${code})(...data);
    postMessage(result);
  }
`;

  return `data:application/javascript;base64,${btoa(wrapped)}`;
}
