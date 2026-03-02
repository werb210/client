export const Validate = {
  required(value: unknown) {
    return value !== null && value !== undefined && value !== "";
  },

  number(value: unknown) {
    return !isNaN(Number(value));
  },

  positive(value: unknown) {
    return Number(value) > 0;
  },

  email(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  },

  phone(value: string) {
    return /^[0-9\-\(\)\+\s]{7,20}$/.test(value);
  }
};
