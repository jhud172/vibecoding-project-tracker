// Preserve original strings, including damaged JSON. Account/session keys are
// deliberately outside this allowlist; recovery exports must not include tokens.
export function rawStorageValues(storage) {
  const values = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith("relay.") || key?.startsWith("vibetracker."))
      values[key] = storage.getItem(key);
  }
  return values;
}
