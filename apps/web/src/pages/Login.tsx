import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  LogIn,
  SquareAsterisk,
  PawPrint,
} from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { env, logEnvironmentInfo } from "@/lib/env";
import { useLogin } from "@/hooks/useAuth";
import type { LoginCredentials } from "@/lib/api";

// Validation schema using Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

// Initial form values
const initialValues = {
  email: "",
  password: "",
  rememberMe: false,
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // TanStack Query mutation for login
  const loginMutation = useLogin();

  // Display environment variable value using utility
  logEnvironmentInfo();

  const handleSubmit = async (
    values: LoginCredentials,
    { setSubmitting, setFieldError }: any
  ) => {
    try {
      const result = await loginMutation.mutateAsync(values);
      if (result.success) {
        navigate("/dashboard");
      } else {
        // Handle unsuccessful login
        setFieldError("password", result.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle different types of errors
      if (error.status === 401) {
        setFieldError("password", "Invalid email or password");
      } else if (error.status === 400) {
        setFieldError("email", error.message || "Invalid input");
      } else {
        setFieldError(
          "password",
          error.message || "Login failed. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {/* Decorative background grid */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 [background:radial-gradient(1200px_circle_at_10%_10%,theme(colors.slate.200/.4),transparent_40%),radial-gradient(1000px_800px_at_90%_10%,theme(colors.indigo.200/.35),transparent_40%)] dark:[background:radial-gradient(1200px_circle_at_10%_10%,theme(colors.slate.800/.5),transparent_40%),radial-gradient(1000px_800px_at_90%_10%,theme(colors.indigo.900/.3),transparent_40%)]" />
        <motion.svg
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 1.2 }}
          className="absolute -left-24 top-24 h-64 w-64 blur-3xl"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            className="text-indigo-300/60 dark:text-indigo-700/30"
            d="M44.8,-59.6C58.6,-52.4,69.5,-39.5,73.1,-25.2C76.7,-10.9,73.1,5,66.2,18.1C59.2,31.1,48.9,41.3,36.4,52.2C23.9,63.1,12,74.7,-1.3,76.5C-14.6,78.3,-29.2,70.2,-41.1,59.5C-53,48.8,-62.2,35.5,-66.1,20.7C-70,5.8,-68.6,-10.7,-61.7,-23.2C-54.7,-35.7,-42.1,-44.1,-29.6,-52.2C-17.1,-60.3,-5.7,-68,7.5,-77.3C20.7,-86.6,41.4,-97.5,44.8,-59.6Z"
            transform="translate(100 100)"
          />
        </motion.svg>
      </div>

      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        {/* Left side */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative hidden items-center justify-center p-10 lg:flex"
        >
          <div className="max-w-md">
            <BadgeLogo />
            <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome back
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Sign in to access your dashboard, track progress, and manage your
              account.
            </p>
            {/* Display environment variable for development */}
            {env.isDevelopment && (
              <div className="mt-2 rounded-md bg-slate-100 p-2 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <div>API URL: {env.API_URL}</div>
                <div>API Base: {env.API_BASE}</div>
                <div>ML Base: {env.ML_BASE}</div>
                <div>
                  Mode: {env.isDevelopment ? "Development" : "Production"}
                </div>
              </div>
            )}
            <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-3">
                <SquareAsterisk className="mt-0.5 h-4 w-4" /> Secure,
                privacy-first authentication
              </li>
              <li className="flex items-start gap-3">
                <SquareAsterisk className="mt-0.5 h-4 w-4" /> Dark mode ready
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Right side - form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center p-6 sm:p-10"
        >
          <Card className="w-full max-w-md border-slate-200/70 bg-white/70 shadow-xl backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/50">
            <CardHeader>
              <div className="mb-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
                  <LogIn className="h-4 w-4" />
                </span>
                <span>Sign in</span>
              </div>
              <CardTitle className="text-2xl">Your account</CardTitle>
              <CardDescription>
                Welcome back! Please enter your details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="space-y-4">
                    {/* Show global error message if login mutation failed */}
                    {loginMutation.isError && (
                      <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
                        {loginMutation.error?.message ||
                          "An error occurred during login"}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Field name="email">
                          {({ field }: any) => (
                            <Input
                              {...field}
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              className={cn(
                                "pl-9",
                                errors.email &&
                                  touched.email &&
                                  "ring-2 ring-red-500/60 focus-visible:ring-red-500"
                              )}
                              aria-invalid={!!(errors.email && touched.email)}
                              aria-describedby={
                                errors.email && touched.email
                                  ? "email-error"
                                  : undefined
                              }
                              autoComplete="email"
                            />
                          )}
                        </Field>
                      </div>
                      <ErrorMessage name="email">
                        {(msg) => (
                          <p id="email-error" className="text-sm text-red-600">
                            {msg}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Field name="password">
                          {({ field }: any) => (
                            <Input
                              {...field}
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className={cn(
                                "pl-9 pr-10",
                                errors.password &&
                                  touched.password &&
                                  "ring-2 ring-red-500/60 focus-visible:ring-red-500"
                              )}
                              aria-invalid={
                                !!(errors.password && touched.password)
                              }
                              aria-describedby={
                                errors.password && touched.password
                                  ? "password-error"
                                  : undefined
                              }
                              autoComplete="current-password"
                            />
                          )}
                        </Field>
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 active:scale-[.98] dark:hover:bg-slate-800"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <ErrorMessage name="password">
                        {(msg) => (
                          <p
                            id="password-error"
                            className="text-sm text-red-600"
                          >
                            {msg}
                          </p>
                        )}
                      </ErrorMessage>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Field
                          name="rememberMe"
                          type="checkbox"
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                        />
                        Remember me
                      </label>
                      <a
                        href="#"
                        className="text-indigo-600 hover:underline hover:underline-offset-4 dark:text-indigo-400"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || loginMutation.isPending}
                      className="group w-full justify-center gap-2 rounded-2xl"
                    >
                      {isSubmitting || loginMutation.isPending ? (
                        <span className="relative inline-flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
                          Signing in...
                        </span>
                      ) : (
                        <>
                          Continue
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-2">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400"
                >
                  Sign up
                </a>
              </p>
              <p className="text-xs text-slate-500">
                By signing in, you agree to our{" "}
                <a href="#" className="underline underline-offset-2">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline underline-offset-2">
                  Privacy Policy
                </a>
                .
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function BadgeLogo() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm shadow-sm ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/60 dark:ring-slate-800">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
        <PawPrint className="h-4 w-4" />
      </div>
      <span className="font-semibold tracking-tight">StraySafe</span>
    </div>
  );
}
