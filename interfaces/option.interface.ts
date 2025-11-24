export interface Option<T = undefined> {
  label: string;
  value: string;
  data?: T;
}
