import { useEffect, useState } from "react";
import { KeyRound, Mail, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { QuoteLeft } from "../../assets/icons/Quotes";
import { login, signInWithGoogle } from "../../lib/firebase/auth";
import { toast } from "../../hooks/useToast";
// import { Alert, AlertDescription } from "@/components/ui/alert";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Get the state passed from the SignUp component
    const state = location.state;
    if (state?.email) {
      setEmail(state.email);
    }
    if (state?.message) {
      setMessage(state.message);
    }
    console.log(message);
    // Clear the location state after using it
    window.history.replaceState({}, document.title);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      const from = (location.state as any)?.from?.pathname || "/profile";
      navigate(from, { replace: true });
      toast({
        title: "",
        variant: "success",
        description: "Sign In successful",
        duration: 5000,
      });
    } catch (error: any) {
      let errorMessage = "Failed to sign in";

      if (error.code === "auth/wrong-password") {
        errorMessage = "Invalid password. Please try again.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage =
          "Invalid credentials. Please check your email and password.";
      } else if (error.message.includes("Password must contain")) {
        errorMessage =
          "Password must contain at least one uppercase letter and one number.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithGoogle();
      const from = (location.state as any)?.from?.pathname || "/profile";
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center overflow-hidden">
      <div className="w-full h-full rounded-2xl bg-background flex overflow-hidden">
        <div className="w-1/2 flex items-center">
          <div className="w-full max-w-md mx-auto px-6">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-medium text-textBlack">
                Sign in to your account
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    placeholder="example@email.com"
                    required
                  />
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    placeholder="••••••••"
                    required
                  />
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/60 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Sign In
              </button>

              <div className="text-center text-sm">
                <span className="text-gray-500">Don't have an account?</span>
                <Link
                  to="/signup"
                  className="ml-1.5 text-gray-900 underline hover:text-gray-800"
                >
                  Sign Up
                </Link>
              </div>

              <div className="text-center text-sm">
                <Link
                  to="/reset-password"
                  className="text-gray-900 underline hover:text-gray-800"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-gray-500">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </form>
          </div>
        </div>
        <div className="w-1/2 bg-black relative">
          <img
            src="/recipes/cover1.jfif"
            alt="Auth background"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-16 left-8 max-w-sm flex flex-col items-start">
            <QuoteLeft className="text-background mb-3" />
            <blockquote className="italic text-background text-base">
              The food you eat can be either the safest and most powerful form
              of medicine or the slowest form of poison.
            </blockquote>
            <p className="mt-3 text-background text-xs">
              - Ann Wigmore, Holistic Health Practitioner
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;