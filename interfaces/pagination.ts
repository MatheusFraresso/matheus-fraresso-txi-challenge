export default interface Pagination<T> {
  count: number;
  next: string;
  previous: string;
  results: T[];
}
