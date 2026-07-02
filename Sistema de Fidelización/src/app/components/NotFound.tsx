import React from "react";
import { Link, type LinkProps } from "react-router";

const ForwardedLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => <Link ref={ref} {...props} />
);
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Home, AlertCircle } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="size-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">Página no encontrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            La página que buscas no existe o ha sido movida.
          </p>
          <Button asChild>
            <ForwardedLink to="/">
              <Home className="mr-2 size-4" />
              Volver al Dashboard
            </ForwardedLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
