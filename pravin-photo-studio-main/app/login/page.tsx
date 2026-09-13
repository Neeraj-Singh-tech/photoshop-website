"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setErrorMessage(
        "Invalid email or password."
      );

      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="login-page">

      <div className="login-container">

        <div className="login-brand">
          <span>
            PRAVIN
          </span>

          <small>
            PHOTO STUDIO
          </small>
        </div>


        <div className="login-card">

          <div className="login-header">

            <span>
              OWNER ACCESS
            </span>

            <h1>
              Welcome back.
            </h1>

            <p>
              Sign in to manage your photography
              portfolio.
            </p>

          </div>


          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="login-field">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="owner@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(
                    event.target.value
                  );
                }}
                required
              />

            </div>


            <div className="login-field">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value
                  );
                }}
                required
              />

            </div>


            {errorMessage && (
              <p className="login-error">
                {errorMessage}
              </p>
            )}


            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

        </div>


        <a
          href="/"
          className="login-back"
        >
          ← Back to website
        </a>

      </div>

    </main>
  );
}