function log(msg) {
  const time = new Date().toISOString();
  console.log(`[${time}] ${msg}`);
}

export { log };
