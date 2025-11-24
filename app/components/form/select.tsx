"use client";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useCheckClickOutside } from "@/hooks/useCheckClickOutside";
import Input from "./input";
import { Option } from "@/contracts/option.interface";

interface SelectProps<T = undefined> {
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  defaultValue?: Option | string;
  options: Option<T>[];
  onSelect: (item: Option<T>) => void;
}

export default function Select<T = undefined>({
  placeholder,
  disabled,
  label,
  error,
  options,
  onSelect,
  defaultValue,
}: SelectProps<T>) {
  const ref = useRef(null);

  const [selected, setSelected] = useState<Option<T> | undefined>(
    options.find((opt) => opt.value === defaultValue) || undefined
  );

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const defaultSelected =
      options.find((opt) => opt.value === defaultValue) || undefined;
    if (defaultSelected) setSelected(defaultSelected);
  }, [options, defaultValue]);

  useCheckClickOutside(ref, () => setOpen(false));

  return (
    <div className="w-full relative" ref={ref}>
      <div className="w-full flex relative items-center cursor-pointer">
        <Input
          label={label}
          error={error}
          type="text"
          readOnly
          value={selected?.label || ""}
          onClick={() => {
            if (!disabled) setOpen((prev) => !prev);
          }}
          placeholder={placeholder || ""}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent border-neutral-30`}
        />
        <div className="absolute flex items-end bottom-3 justify-center h-full w-fit right-0 cursor-pointer">
          <FaChevronDown
            className="absolute !z-40 right-2 my-auto"
            onClick={() => !disabled && setOpen((prev) => !prev)}
          />
        </div>
      </div>

      {open && !disabled && (
        <div className="absolute mt-1 bg-white rounded-b-md w-full shadow max-h-72 overflow-y-auto !z-50 custom-scrollbar">
          <ul className="list-none py-2 w-full space-y-2">
            {options.map((option, index) => (
              <li
                key={index}
                className="py-1 hover:border-primary-main hover:bg-primary-05  hover:text-primary-main cursor-pointer h-12 "
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                  onSelect(option);
                }}
              >
                <div className="h-full pl-4 flex items-center space-x-2 py-1">
                  <div className="h-full w-[3px] left-2 bg-primary-main rounded-full opacity-0 hover:opacity-100" />
                  <span>{option.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
