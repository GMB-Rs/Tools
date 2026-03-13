import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Loader2, Chrome } from "lucide-react";

export function Login() {

  const [error, setError] = useState("");
  const [loadingButton, setLoadingButton] = useState(false);

  const { signInWithGoogle, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    // esperar o Firebase terminar de verificar login
    if (loading) return;

    if (user) {

      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }

    }

  }, [user, isAdmin, loading, navigate]);

  const handleGoogleSignIn = async () => {
    setLoadingButton(true);
    setError("");

    const result = await signInWithGoogle();

    if (!result.success) {
      setError(result.error || "Erro ao fazer login");
    }

    setLoadingButton(false); // sempre resetar botão
    // em caso de sucesso o useEffect ainda pode redirecionar o usuário
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      <Card className="w-full max-w-md">

        <CardHeader className="text-center">

          <CardTitle className="text-2xl font-bold">
            Entrar
          </CardTitle>

          <CardDescription>
            Faça login com sua conta Google
          </CardDescription>

        </CardHeader>

        <CardContent>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGoogleSignIn}
            className="w-full py-6 text-base"
            disabled={loadingButton}
            variant="outline"
          >

            {loadingButton ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <Chrome className="mr-2 h-5 w-5" />
                Continuar com Google
              </>
            )}

          </Button>

        </CardContent>

      </Card>

    </div>
  );

}