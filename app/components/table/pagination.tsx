"use client";
import { cn } from "@/utils/twMerge";
import { useRouter, useSearchParams } from "next/navigation";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaEllipsis } from "react-icons/fa6";

interface PaginationProps {
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  nextPage: number;
  page: number;
  previousPage: number;
  total: number;
  totalPages: number;
  formRef: RefObject<HTMLFormElement | null>;
  handleNext?: () => void;
  handlePrev?: () => void;
  handleChangePerPage?: () => void;
}

export function Pagination({
  total,
  formRef,
  totalPages,
  page: pageProp,
  limit: limitProp,
}: PaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [limit, setLimit] = useState(searchParams.get("limit") || limitProp);
  const [page, setPage] = useState(searchParams.get("page") || pageProp);
  const [offset, setOffset] = useState<number>(0);
  const pageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentPage = searchParams.get("page") || "1";
    const currentLimit = searchParams.get("limit") || limitProp;

    if (currentPage !== page) {
      setPage(currentPage);
    }
    if (currentLimit !== limit) {
      setLimit(currentLimit);
    }
  }, [searchParams, page, limit, limitProp]);

  function updatePageRef(page: any) {
    if (!pageRef.current) return;
    pageRef.current.value = `${page}`;
    // Voltei para o original por que o código abaixo quebrou a paginação, não mudava o por página
    formRef.current?.submit();
  }

  const pages = useMemo(() => {
    return (
      <div className=" flex space-x-3 justify-between">
        <div
          className={cn(
            "size-8 m-auto flex items-center hover:scale-105  rounded-sm justify-center",
            +page <= 1
              ? "cursor-not-allowed text-neutral-40"
              : "cursor-pointer text-neutral-90 hover:bg-neutral-10"
          )}
          onClick={() => {
            if (+page <= 1) return;
            updatePageRef(+page - 1 > 1 ? +page - 1 : 1);
          }}
        >
          <FaChevronLeft />
        </div>
        <div className="flex  space-x-2">
          <span
            className={cn(
              "cursor-pointer size-8 m-auto flex items-center hover:scale-105 hover:bg-neutral-10 rounded-sm justify-center",
              +page === 1 ? " text-white rounded-[10px] bg-primary-main" : ""
            )}
            onClick={() => {
              if (+page === 1) return;
              updatePageRef(1);
            }}
          >
            1
          </span>
          {[...Array(7).keys()].map((_, index) => {
            const value = +page - 2 + index + offset;
            if (value < 2 || value > totalPages - 1) return;
            if (index === 0 && +page - 1 > 3 && value > 5)
              return (
                <span
                  className={cn(
                    "cursor-pointer size-8 m-auto flex items-center hover:scale-105 hover:bg-neutral-10 rounded-sm justify-center"
                  )}
                  key={value}
                  onClick={() => {
                    setOffset((prev) => prev - 5);
                  }}
                >
                  <FaEllipsis />
                </span>
              );
            if (index === 6 && +page + 1 < totalPages && value < totalPages - 1)
              return (
                <span
                  className={cn(
                    "cursor-pointer size-8 m-auto flex items-center hover:scale-105 hover:bg-neutral-10 rounded-sm justify-center"
                  )}
                  key={value}
                  onClick={() => {
                    setOffset((prev) => prev + 5);
                  }}
                >
                  <FaEllipsis />
                </span>
              );

            return (
              <span
                className={cn(
                  "cursor-pointer size-8 m-auto flex items-center hover:scale-105 hover:bg-neutral-10 rounded-sm justify-center",
                  +page === value
                    ? " text-white rounded-[10px] bg-primary-main"
                    : ""
                )}
                key={value}
                onClick={() => {
                  updatePageRef(value);
                }}
              >
                {value}
              </span>
            );
          })}
          {totalPages > 1 && (
            <span
              className={cn(
                "cursor-pointer size-8 m-auto flex items-center hover:scale-105 hover:bg-neutral-10 rounded-sm justify-center",
                +page === totalPages
                  ? " text-white rounded-[10px] bg-primary-main"
                  : ""
              )}
              onClick={() => {
                updatePageRef(totalPages);
              }}
            >
              {totalPages}
            </span>
          )}
        </div>

        <div
          className={cn(
            "size-8 m-auto flex items-center hover:scale-105  rounded-sm justify-center",
            +page >= totalPages
              ? " cursor-not-allowed text-neutral-40"
              : "cursor-pointer text-neutral-90 hover:bg-neutral-10"
          )}
          onClick={() => {
            if (+page >= totalPages) return;
            updatePageRef(+page + 1 < totalPages ? +page + 1 : totalPages);
          }}
        >
          <FaChevronRight />
        </div>

        <input ref={pageRef} type="hidden" value={page} name="page" />
      </div>
    );
  }, [page, totalPages, offset]);

  return (
    <div className="relative w-full grid grid-cols-5">
      <div className="flex space-x-4 items-center col-span-2">
        <select
          name="limit"
          value={limit}
          onChange={(e) => {
            setLimit(e.target.value);
            updatePageRef("1");
          }}
          className="h-full w-fit rounded-[10px] border border-neutral-90 py-2 px-4"
        >
          <option value={10}>10 por página</option>
          <option value={30}>30 por página</option>
          <option value={50}>50 por página</option>
        </select>
        <span className="text-theme-neutral-50">{total} resultados</span>
      </div>
      <div className="flex items-center w-full col-span-3">{pages}</div>
    </div>
  );
}
