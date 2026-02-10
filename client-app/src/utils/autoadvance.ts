const autocompleteFields = ["address", "street"];

export function shouldAutoAdvance(fieldKey: string, value: unknown) {
  return autocompleteFields.includes(fieldKey) && Boolean(value);
}
