import React, { useState } from "react";
import { User, KeyRound, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { QuoteLeft } from "../../assets/icons/Quotes";
import { signUp, signInWithGoogle } from "../../lib/firebase/auth";
import { SignUpInput } from "../../types/firestore";
import { toast } from "../../hooks/useToast";
// import { useAuth } from "../../context/AuthContext";

const SignUp = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });

  // Redirect if user is already logged in
  // React.useEffect(() => {
  //   if (user) {
  //     navigate("/dashboard");
  //   }
  // }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const signUpData: SignUpInput = {
        displayName: formData.displayName,
        email: formData.email,
        password: formData.password,
      };

      const result = await signUp(signUpData);

      if (result?.success) {
        setSuccess(result.message);
        // Wait for 2 seconds to show the success message before redirecting
        setTimeout(() => {
          navigate("/login", {
            state: {
              email: formData.email,
              message:
                "Account created successfully! Please check your email for verification before logging in.",
            },
          });
        }, 2000);
      }
    } catch (err: any) {
      let errorMessage = "Failed to create account";

      // Enhanced error messages that match toast notifications
      if (err.message?.includes("already registered")) {
        errorMessage =
          "This email is already registered. Please try signing in.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (err.message?.includes("Password must contain")) {
        errorMessage =
          "Password must contain at least one uppercase letter and one number.";
      } else if (err.message?.includes("Display name")) {
        errorMessage = "Display name must be at least 6 characters long.";
      } else if (err.code === "auth/network-request-failed") {
        errorMessage =
          "Network error. Please check your internet connection and try again.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate("/");
      toast({
        title: "Success",
        description: "Sign In successful",
        duration: 3000,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during Google sign in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center overflow-hidden">
      <div className="w-full h-full rounded-2xl bg-background flex overflow-hidden">
        <div className="w-1/2 flex items-center">
          <div className="w-full max-w-md mx-auto p-6">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-medium text-textBlack">
                Create an account
              </h2>
            </div>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    placeholder="John Doe"
                    required
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
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
                className="w-full rounded-md bg-gradient-to-b from-[#637257] to-[#4b5942] px-4 py-2 text-sm font-medium text-white hover:from-[#4b5942] hover:to-[#3c4735] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>

              <div className="text-center text-sm">
                <span className="text-gray-500">Already have an account?</span>
                <Link
                  to="/login"
                  className="ml-1.5 text-gray-900 object-cover underline hover:text-gray-800"
                >
                  Sign In
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
                {loading ? "Signing in..." : "Continue with Google"}
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
            <QuoteLeft className="text-textWhite mb-3" />
            <blockquote className="italic text-textWhite text-base">
              The food you eat can be either the safest and most powerful form
              of medicine or the slowest form of poison.
            </blockquote>
            <p className="mt-3 text-textWhite text-xs">
              - Ann Wigmore, Holistic Health Practitioner
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
