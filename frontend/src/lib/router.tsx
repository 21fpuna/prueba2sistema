/**
 * Mini enrutador SPA basado en la History API. Cubre lo que necesita esta
 * aplicación (rutas planas + enlaces internos) sin dependencias externas.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface RouterContextValue {
  pathname: string;
  navigate: (to: string, opciones?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextValue>({
  pathname: "/",
  navigate: () => {},
});

export function Router({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (to: string, opciones?: { replace?: boolean }) => {
    if (opciones?.replace) window.history.replaceState(null, "", to);
    else window.history.pushState(null, "", to);
    setPathname(window.location.pathname);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname };
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, onClick, children, ...props }, ref) => {
    const navigate = useNavigate();
    return (
      <a
        ref={ref}
        href={to}
        onClick={(e) => {
          onClick?.(e);
          if (
            !e.defaultPrevented &&
            e.button === 0 &&
            !e.metaKey &&
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey
          ) {
            e.preventDefault();
            navigate(to);
          }
        }}
        {...props}
      >
        {children}
      </a>
    );
  }
);

/** Redirección declarativa (equivalente a <Navigate /> de react-router) */
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace]);
  return null;
}
