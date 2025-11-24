"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { NestedKeyOf, TableProps } from "./table.types";
import { Option } from "@/contracts/option.interface";
import { Pagination as PaginationComponent } from "./pagination";
import Pagination from "@/contracts/pagination";
import Select from "../form/select";

function getValueByPath(obj: any, path?: string) {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

/**
 * Componente de tabela paginada com suporte a filtros, seleção de linhas e paginação.
 *
 * @template T - Tipo dos itens exibidos na tabela.
 * @template U - Tipo dos filtros aplicáveis.
 *
 * @see TableProps
 *
 * @example
 * ```tsx
 * <Table
 *   data={pagination}
 *   columnsDataMap={columns}
 *   filters={filters}
 *   hasSearchTerm
 *   selectable
 *   selectedItems={selected}
 *   handleSelectItem={handleSelectItem}
 *   handleSelectAll={handleSelectAll}
 * />
 * ```
 */
export default function Table<
  T extends object,
  U extends { [key: string]: any } = { [key: string]: any }
>({
  children,
  filters,
  hasSearchTerm,
  headerComponent,
  actionsComponent,
  aditionalInfoComponent,
  footerComponent,
  data,
  selectable,
  columnsDataMap,
  selectedItems,
  isLoading,
  isPaginated = true,
  rowActions,
  rowInfo,
  handleSelectItem,
  handleSelectAll,
  onFormChange,
  onFormSubmit,
  clearFilters,
}: TableProps<T, U>) {
  const items: T[] = Array.isArray(data) ? data : data.results;

  const formRef = useRef<HTMLFormElement>(null);
  const serchParams = useSearchParams();

  const [searchForm, setSearchForm] = useState<U>(() => {
    const initial: any = {};
    filters?.forEach((filter) => {
      initial[filter.name] = serchParams.get(String(filter.name)) || "";
    });
    if (hasSearchTerm) {
      initial["searchTerm"] = serchParams.get("searchTerm") || "";
    }
    return initial;
  });

  function renderCell<T extends object>(
    item: T,
    key?: NestedKeyOf<T>,
    callback?: (item: T) => ReactNode
  ): ReactNode {
    if (!key && !callback) return <></>;
    if (!callback) return getValueByPath(item, key) as ReactNode;
    return callback(item) as ReactNode;
  }

  return (
    <form
      className="space-y-6 w-full w-max-[100vw]"
      ref={formRef}
      onChange={onFormChange}
      onSubmit={onFormSubmit}
    >
      {headerComponent}
      {/* Filters */}
      <div>
        {filters && (
          <div className="bg-white w-full rounded-lg p-4 mb-6 shadow-sm space-y-6 flex items-center ">
            <div className="flex flex-wrap gap-4 items-center w-[85%]">
              {filters.map((filter, index) => (
                <div className="w-full max-w-[200px]" key={index}>
                  <label
                    className="block font-se text-neutral-900 mb-1 whitespace-nowrap line-clamp-1 truncate"
                    title={filter.label}
                  >
                    {filter.label}
                  </label>
                  {filter.type === "select" && (
                    <>
                      <input
                        type="hidden"
                        value={searchForm[filter.name] || ""}
                        name={String(filter.name)}
                      />
                      <Select<Option>
                        options={filter.options}
                        defaultValue={searchForm[filter.name] || ""}
                        onSelect={(option) =>
                          setSearchForm((curr) => ({
                            ...curr,
                            [filter.name]: option.value,
                          }))
                        }
                      />
                    </>
                  )}
                  {filter.type === "text" && (
                    <input
                      type="text"
                      placeholder={filter.placeholder || ""}
                      value={searchForm[filter.name as keyof U] || ""}
                      onChange={(e) =>
                        setSearchForm((curr) => ({
                          ...curr,
                          [filter.name]: e.target.value,
                        }))
                      }
                      name={String(filter.name)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex space-x-2 justify-end items-end h-full w-[15%]">
              <button
                className="text-neutral-200 border-primary-main bg-orange-300 hover:bg-orange- rounded-full px-6 cursor-pointer"
                type="reset"
                onClick={() => {
                  const clearForm: any = {};
                  filters?.forEach((filter) => {
                    clearForm[filter.name] = null;
                  });

                  setSearchForm(clearForm);
                  clearFilters?.();
                }}
              >
                Clear
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-800 text-white rounded-full px-6 cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>
        )}

        {/* Aditional info like summary or totals */}
        {aditionalInfoComponent}

        {/* Search and actions */}
        {hasSearchTerm && (
          <div className="flex items-center mb-4 justify-between ">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="searchTerm"
                placeholder="Buscar"
                value={searchForm.searchTerm || ""}
                onChange={(e) =>
                  setSearchForm((curr) => ({
                    ...curr,
                    searchTerm: e.target.value ?? null,
                  }))
                }
                className="pl-10 pr-4 py-2 border border-neutral-30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {actionsComponent}
          </div>
        )}
        {!hasSearchTerm && (
          <div className="w-full flex items-end justify-end">
            {actionsComponent}
          </div>
        )}
      </div>

      <div className="rounded-lg shadow-sm overflow-x-scroll lg:overflow-visible relative">
        {isLoading && (
          <div className="size-full absolute z-50 flex items-center justify-center ">
            {/* <Spinner className=" border-primary-main size-10" /> */}
          </div>
        )}
        <table
          className={
            " w-full border-spacing-y-3 border-separate paginated-table "
          }
        >
          <thead>
            <tr>
              {/* Colunas dinâmicas */}
              {columnsDataMap.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-sm font-medium text-neutral-900 "
                >
                  {column.label}
                </th>
              ))}
              {/* Coluna de ações  */}

              {rowActions ? (
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 flex items-center justify-end ">
                  Ações
                </th>
              ) : (
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900">
                  {""}
                </th>
              )}

              {rowInfo ? (
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900 flex items-center justify-end ">
                  Info
                </th>
              ) : (
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-900">
                  {""}
                </th>
              )}
            </tr>
          </thead>
          <tbody
            className={`divide-y divide-gray-200 overflow-x-scroll lg:overflow-auto  overflow-hidden ${
              isLoading ? "blur-[2px]" : ""
            }`}
          >
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-neutral-300 w-fit bg-white rounded-[10px] border"
                >
                  {selectable && selectedItems && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="form-check-input cursor-pointer"
                        checked={!!selectedItems.get(index)}
                        onChange={() => handleSelectItem!(item, index)}
                      />
                    </td>
                  )}

                  {columnsDataMap.map((column, key) => (
                    <td
                      className="lg:px-4 lg:py-3 text-ellipsis whitespace-nowrap text-wrap truncate "
                      key={key}
                    >
                      {renderCell(
                        item,
                        column.key,
                        "callback" in column ? column.callback : undefined
                      )}
                    </td>
                  ))}

                  {rowActions ? (
                    <td className="px-4 py-3 ">{rowActions!(item)}</td>
                  ) : (
                    <td className="px-4 py-3" />
                  )}
                  {rowInfo ? (
                    <td className="px-4 py-3">{rowInfo!(item)}</td>
                  ) : (
                    <td className="px-4 py-3" />
                  )}
                </tr>
              ))
            ) : !isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-neubg-neutral-3000"
                >
                  Nenhum dado encontrado.
                </td>
              </tr>
            ) : (
              <></>
            )}
          </tbody>
          <tfoot>{footerComponent}</tfoot>
        </table>
      </div>
      {isPaginated && (
        <PaginationComponent
          hasNext={false}
          hasPrevious={false}
          limit={0}
          nextPage={0}
          page={0}
          previousPage={0}
          total={0}
          totalPages={0}
          {...(data as Pagination<T>)}
          formRef={formRef}
        />
      )}
    </form>
  );
}
