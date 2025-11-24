import {
  DetailedHTMLProps,
  HTMLInputTypeAttribute,
  InputHTMLAttributes,
  ReactNode,
} from "react";

interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  error?: string;
  label?: string | ReactNode;
  labelPosition?: "top" | "right";
  required?: boolean;
  prefixComponent?: React.ReactNode;
  postfixComponent?: React.ReactNode;
  type?: HTMLInputTypeAttribute | "switch" | "toggle";
}

export default function Input({
  error,
  label,
  required,
  prefixComponent,
  postfixComponent,
  labelPosition = "top",
  type,
  ...rest
}: InputProps) {
  const randId = Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full h-fit">
      {label && labelPosition === "top" && (
        <label className="block text-sm font-medium text-neutral-70 mb-1">
          {label} {required && <span className="text-danger-50">*</span>}
        </label>
      )}

      <div className="flex items-center h-11 space-x-1 relative">
        {prefixComponent}

        {type === "switch" || type === "toggle" ? (
          <div className="relative w-8 h-4 items-center flex">
            <input
              {...rest}
              checked={rest.checked}
              id={randId}
              type="checkbox"
              className="peer appearance-none w-8 h-5 bg-neutral-20 rounded-full checked:bg-primary-main cursor-pointer transition-colors duration-300"
            />
            <label
              htmlFor={randId}
              className="absolute top-0 left-[3px] size-4 bg-white rounded-full border border-slate-300 shadow-sm transition-transform duration-300 peer-checked:translate-x-[11px] peer-checked:border-primary-main cursor-pointer"
            ></label>
          </div>
        ) : (
          <input
            {...rest}
            type={type}
            className={`h-11 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent ${
              error ? "border-danger-50" : "border-neutral-30"
            }`}
          />
        )}

        {label && labelPosition === "right" && (
          <label className="block font-normal text-neutral-70">
            {label} {required && <span className="text-danger-50">*</span>}
          </label>
        )}
        {postfixComponent && (
          <div className="flex items-end">{postfixComponent}</div>
        )}
      </div>
      {!!error && <p className="text-danger-50 text-xs mt-1">{error}</p>}
    </div>
  );
}
