import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LuChevronDown, LuCheck } from "react-icons/lu";
import { cn } from "./utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  etiquetas: Map<string, ReactNode>;
}

const SelectContext = createContext<SelectContextValue | null>(null);

/** Recorre los hijos buscando <SelectItem> para armar el mapa valor → etiqueta */
function recolectarEtiquetas(
  children: ReactNode,
  mapa: Map<string, ReactNode>
) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as {
      value?: string;
      children?: ReactNode;
    };
    if (child.type === SelectItem && props.value !== undefined) {
      mapa.set(props.value, props.children);
    } else if (props.children) {
      recolectarEtiquetas(props.children, mapa);
    }
  });
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  const etiquetas = new Map<string, ReactNode>();
  recolectarEtiquetas(children, etiquetas);

  useEffect(() => {
    if (!open) return;
    const onClickAfuera = (e: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickAfuera);
    return () => document.removeEventListener("mousedown", onClickAfuera);
  }, [open]);

  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, etiquetas }}
    >
      <div className="select" ref={contenedorRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  return (
    <button
      type="button"
      className={cn("select-trigger", className)}
      onClick={() => ctx.setOpen(!ctx.open)}
      aria-haspopup="listbox"
      aria-expanded={ctx.open}
    >
      <span className="select-valor">{children}</span>
      <LuChevronDown className="select-flecha" />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  const etiqueta = ctx.value ? ctx.etiquetas.get(ctx.value) : undefined;
  if (etiqueta !== undefined) return <>{etiqueta}</>;
  return <span className="select-placeholder">{placeholder ?? ""}</span>;
}

export function SelectContent({ children }: { children: ReactNode }) {
  const ctx = useContext(SelectContext);
  if (!ctx || !ctx.open) return null;
  return (
    <div className="select-contenido" role="listbox">
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const ctx = useContext(SelectContext);
  if (!ctx) return null;
  const seleccionado = ctx.value === value;
  return (
    <div
      role="option"
      aria-selected={seleccionado}
      className={cn("select-item", seleccionado && "select-item-activo")}
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
    >
      <span className="select-item-check">
        {seleccionado && <LuCheck />}
      </span>
      {children}
    </div>
  );
}
