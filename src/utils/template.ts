/** Helper function for validation rules */
export function getSafeValidationRules(field) {
  if (!field) return {};
  const rules = field.validationRules || {};
  return {
    minLength: rules.minLength,
    maxLength: rules.maxLength,
    min: rules.min,
    max: rules.max,
    pattern: rules.pattern,
  };
}