import Pagination from "@/contracts/pagination";
import { ReactElement, ReactNode } from "react";

/**
 * Gets the value of a nested property using a string path.
 * Example: "user.name.first"
 *
 * @example
 * getValueByPath({ user: { name: { first: "John" } } }, "user.name.first");
 * // → "John"
 */
export declare function getValueByPath(obj: any, path?: string): any;

/**
 * Returns the keys of an object including nested properties up to a certain depth.
 *
 * @template T - Base object.
 * @template Depth - Maximum allowed depth (default: 2).
 *
 * @example
 * type A = { user: { name: string; address: { city: string } } };
 * type Keys = NestedKeyOf<A>; // "user" | "user.name" | "user.address" | "user.address.city"
 */
export type NestedKeyOf<T extends object, Depth extends number = 2> = [
  Depth
] extends [never]
  ? never
  : {
      [K in keyof T & string]: T[K] extends object
        ? K | `${K}.${NestedKeyOf<T[K], Decrement[Depth]>}`
        : K;
    }[keyof T & string];

/**
 * Internal helper that decrements the recursion depth on each recursive call.
 */
type Decrement = [never, 0, 1, 2, 3, 4, 5];
/**
 * Represents a table column definition.
 *
 * You can use a direct key from the object (e.g. `"name"`) or a render
 * function to control the cell content.
 *
 * @template T - Type of the data item displayed in the table.
 *
 * @example
 * // Simple example with direct keys
 * const columns = [
 *   { label: "Name", key: "name" },
 *   { label: "Email", key: "email" },
 * ];
 *
 * @example
 * // Example with custom rendering
 * const columns = [
 *   {
 *     label: "Status",
 *     callback: (user) => (
 *       <Badge color={user.active ? "green" : "red"}>
 *         {user.active ? "Active" : "Inactive"}
 *       </Badge>
 *     ),
 *   },
 * ];
 */
export type ColumnDef<T extends object> =
  | {
      /** Header text for the column. */
      label: string;
      /** Path to the object's key (supports nested access: "address.city"). */
      key: NestedKeyOf<T>;
    }
  | {
      /** Header text for the column. */
      label: string;
      /** Path to the object's key (optional when `callback` is used). */
      key?: NestedKeyOf<T>;
      /** Custom render function for this column. */
      callback: (item: T) => ReactNode;
    }
  | {
      /** Header text for the column. */
      label: string;
      /** Path to the object's key (optional when `callback` is used). */
      key?: NestedKeyOf<T>;
      /** Custom renderer element for this column. */
      renderer: Element;
    };

/**
 * Defines a filter displayed above the table.
 *
 * The component automatically creates filter inputs based on this structure.
 *
 * @template U - Type of the filters object (e.g. `{ name: string; status: string }`)
 *
 * @example
 * const filters = [
 *   { type: "text", name: "name", label: "Name", placeholder: "Search by name" },
 *   {
 *     type: "select",
 *     name: "status",
 *     label: "Status",
 *     options: [
 *       { value: "active", label: "Active" },
 *       { value: "inactive", label: "Inactive" },
 *     ],
 *   },
 * ];
 */
export type TableFilter<U> =
  | {
      /** Free text input. */
      type: "text";
      placeholder?: string;
      name: keyof U;
      label: string;
    }
  | {
      /** Select (dropdown) input. */
      type: "select";
      placeholder?: string;
      name: keyof U;
      label: string;
      /** Options available for the select. */
      options: { value: string; label: string }[];
    };

/**
 * Common props shared by all table variants.
 *
 * @template T - Type of the displayed data.
 * @template U - Type of the applicable filters.
 */
export type CommonTableProps<
  T extends object,
  U extends Record<string, any>
> = {
  /** Columns to display. */
  columnsDataMap: ColumnDef<T>[];

  /** Filters to display above the table. */
  filters?: TableFilter<U>[];

  /** Adds a general search field (free text). */
  hasSearchTerm?: boolean;

  /** Component rendered above the table (e.g. title or breadcrumbs). */
  headerComponent?: ReactNode;

  /** Component rendered between filters and table (e.g. summary or totals). */
  aditionalInfoComponent?: ReactNode;

  /** Main actions (e.g. add, export buttons). */
  actionsComponent?: ReactNode;

  /** Component rendered after the table (e.g. footer with totals). */
  footerComponent?: ReactNode;

  /** Optional child component(s). */
  children?: ReactNode;

  /** Shows loading state (spinner and interaction lock). */
  isLoading?: boolean;

  /** Row actions (e.g. edit, delete, view). */
  rowActions?: (item: T) => ReactNode;

  /** Additional info per row (e.g. status icon). */
  rowInfo?: (item: T) => ReactNode;

  /** Triggered when any field in the filter form changes. */
  onFormChange?: (event: any) => void;

  /** Triggered when the filters form is submitted. */
  onFormSubmit?: (event: any) => void;

  /** Function executed when clicking "Clear filters". */
  clearFilters?: () => void;
};

/**
 * Pagination-aware table props union.
 *
 * @template T - Type of the displayed data.
 * @template U - Type of the applicable filters.
 */
export type CheckPaginationType<
  T extends object,
  U extends Record<string, any>
> =
  | ({
      isPaginated?: true | undefined;
      /** Pagination object containing `data`, `total`, `page`, etc. */
      data: Pagination<T>;
    } & CommonTableProps<T, U>)
  | ({
      isPaginated?: false;
      data: T[];
    } & CommonTableProps<T, U>);

/**
 * Props for the paginated table component.
 *
 * @remarks
 * - If `selectable` is `true`, the component renders checkboxes and requires
 *   selection control functions.
 * - Otherwise, the table works as a read-only display.
 *
 * @template T - Type of the displayed data.
 * @template U - Type of the applicable filters.
 */
export type TableProps<
  T extends object,
  U extends Record<string, any> = Record<string, any>
> =
  | ({
      /** Enables multi-row selection. */
      selectable: true;

      /** Map of selected items (index → item). */
      selectedItems: Map<number, T>;

      /** Called when toggling an individual item's selection. */
      handleSelectItem: (item: T, index: number) => void;

      /** Called when toggling select-all. */
      handleSelectAll: (selected: boolean) => void;
    } & CheckPaginationType<T, U>)
  | ({
      /** If omitted or false, disables row selection. */
      selectable?: false;
      selectedItems?: never;
      handleSelectItem?: never;
      handleSelectAll?: never;
    } & CheckPaginationType<T, U>);

/**
 * Props for the Pagination component used inside the table.
 *
 * @example
 * ```tsx
 * <Pagination
 *   total={200}
 *   totalPages={10}
 *   page={1}
 *   limit={20}
 *   formRef={formRef}
 * />
 * ```
 */

export interface PaginationProps {
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  nextPage: number;
  page: number;
  previousPage: number;
  total: number;
  totalPages: number;
  /** Reference to the main form for automatic submission. */
  formRef: React.RefObject<HTMLFormElement | null>;
  handleNext?: () => void;
  handlePrev?: () => void;
  handleChangePerPage?: () => void;
}

/**
 * Full example usage of `Table`.
 *
 * @example
 * ```tsx
 * const pagination = {
 *   data: clients,
 *   total: 100,
 *   totalPages: 10,
 *   page: 1,
 *   limit: 10,
 *   hasNext: true,
 *   hasPrevious: false,
 * };
 *
 * const columns = [
 *   { label: "Name", key: "name" },
 *   { label: "Email", key: "email" },
 *   {
 *     label: "Status",
 *     callback: (client) => (
 *       <span className={client.active ? "text-green-600" : "text-red-500"}>
 *         {client.active ? "Active" : "Inactive"}
 *       </span>
 *     ),
 *   },
 * ];
 *
 * const filters = [
 *   { type: "text", name: "name", label: "Name" },
 *   {
 *     type: "select",
 *     name: "status",
 *     label: "Status",
 *     options: [
 *       { value: "active", label: "Active" },
 *       { value: "inactive", label: "Inactive" },
 *     ],
 *   },
 * ];
 *
 * <Table
 *   data={pagination}
 *   columnsDataMap={columns}
 *   filters={filters}
 *   hasSearchTerm
 *   selectable
 *   selectedItems={selected}
 *   handleSelectItem={handleSelectItem}
 *   handleSelectAll={handleSelectAll}
 *   rowActions={(c) => <Button onClick={() => editClient(c)}>Edit</Button>}
 * />;
 * ```
 */
export type TableExample = void;
