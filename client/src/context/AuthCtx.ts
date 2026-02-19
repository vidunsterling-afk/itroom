import { createContext } from "react";
import type { AuthState } from "./AuthContext";

export const AuthCtx = createContext<AuthState | null>(null);
