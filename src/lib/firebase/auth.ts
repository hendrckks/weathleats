import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  NextOrObserver,
  User,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  updatePassword,
  AuthErrorCodes,
} from "firebase/auth";
import {
  doc,
  serverTimestamp,
  runTransaction,
  DocumentReference,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./clientApp";
import {
  SignUpInput,
  LoginInput,
  ResetPasswordInput,
  signUpSchema,
  loginSchema,
  resetPasswordSchema,
  getZodErrorMessage,
  passwordChangeSchema,
} from "../../types/auth";
import { SESSION_DURATION } from "./config";
import { ZodError } from "zod";

// Enhanced configuration
const CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  SESSION_CHECK_INTERVAL: 60000, // 1 minute
} as const;

// Enhanced types
interface LoginAttempts {
  [email: string]: {
    count: number;
    lockoutUntil?: number;
    lastAttempt: number;
  };
}

// State management
class AuthStateManager {
  private static instance: AuthStateManager;
  private loginAttempts: LoginAttempts = {};
  private sessionTimeout: NodeJS.Timeout | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeSessionCheck();
  }

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  private initializeSessionCheck() {
    this.sessionCheckInterval = setInterval(() => {
      this.cleanupExpiredLockouts();
    }, CONFIG.SESSION_CHECK_INTERVAL);
  }

  private cleanupExpiredLockouts() {
    const now = Date.now();
    Object.keys(this.loginAttempts).forEach((email) => {
      const attempt = this.loginAttempts[email];
      if (attempt.lockoutUntil && now > attempt.lockoutUntil) {
        delete this.loginAttempts[email];
      }
    });
  }

  isUserLockedOut(email: string): boolean {
    const attempt = this.loginAttempts[email];
    if (!attempt?.lockoutUntil) return false;
    return Date.now() <= attempt.lockoutUntil;
  }

  recordLoginAttempt(email: string, success: boolean) {
    if (success) {
      delete this.loginAttempts[email];
      return;
    }

    if (!this.loginAttempts[email]) {
      this.loginAttempts[email] = {
        count: 1,
        lastAttempt: Date.now(),
      };
    } else {
      this.loginAttempts[email].count++;
      this.loginAttempts[email].lastAttempt = Date.now();

      if (this.loginAttempts[email].count >= CONFIG.MAX_LOGIN_ATTEMPTS) {
        this.loginAttempts[email].lockoutUntil =
          Date.now() + CONFIG.LOCKOUT_DURATION;
      }
    }
  }

  startSessionTimeout(callback: () => void) {
    this.clearSessionTimeout();
    this.sessionTimeout = setTimeout(callback, SESSION_DURATION);
  }

  clearSessionTimeout() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  cleanup() {
    this.clearSessionTimeout();
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }
}

// Retry utility
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = CONFIG.RETRY_ATTEMPTS
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      if (attempt === maxAttempts) break;

      if (error?.code === AuthErrorCodes.NETWORK_REQUEST_FAILED) {
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.RETRY_DELAY * attempt)
        );
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

// Enhanced error handling
const handleAuthError = (error: any): never => {
  console.error("Auth error:", error); // Log the full error for debugging
  const errorMessage = (() => {
    switch (error?.code) {
      case AuthErrorCodes.EMAIL_EXISTS:
        return "This email is already in use. Please use a different email or sign in.";
      case AuthErrorCodes.USER_DELETED:
        return "No account found with this email. Please check your credentials or sign up.";
      case AuthErrorCodes.INVALID_PASSWORD:
        return "Incorrect password. Please try again.";
      case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
        return "Invalid email or password. Please check your credentials.";
      case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
        return "Too many failed attempts. Please try again later or reset your password.";
      case AuthErrorCodes.INVALID_EMAIL:
        return "Invalid email format. Please enter a valid email address.";
      case AuthErrorCodes.NETWORK_REQUEST_FAILED:
        return "Network error. Please check your internet connection and try again.";
      case AuthErrorCodes.POPUP_CLOSED_BY_USER:
        return "Sign in popup was closed. Please try again.";
      case "auth/requires-recent-login":
        return "This operation requires recent authentication. Please log in again.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      default:
        return (
          error.message || "An unexpected error occurred. Please try again."
        );
    }
  })();

  throw new Error(errorMessage);
};

// Enhanced user data management
async function updateUserData(
  userRef: DocumentReference,
  data: object,
  merge: boolean = true
): Promise<void> {
  return withRetry(async () => {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists() && !merge) {
        transaction.set(userRef, {
          ...data,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
      } else {
        transaction.set(
          userRef,
          {
            ...data,
            lastLogin: serverTimestamp(),
          },
          { merge: true }
        );
      }
    });
  });
}

// Main authentication functions
export const signUp = async (userData: SignUpInput) => {
  try {
    const validatedData = signUpSchema.parse(userData);

    const usersRef = collection(db, "users");
    const emailQuery = query(
      usersRef,
      where("email", "==", validatedData.email.toLowerCase())
    );
    const querySnapshot = await getDocs(emailQuery);

    if (!querySnapshot.empty) {
      throw new Error(
        "This email is already registered. Please try signing in."
      );
    }

    const userCredential = await withRetry(() =>
      createUserWithEmailAndPassword(
        auth,
        validatedData.email,
        validatedData.password
      )
    );

    const user = userCredential.user;

    await Promise.all([
      sendEmailVerification(user),
      updateProfile(user, {
        displayName: validatedData.displayName,
      }),
      updateUserData(
        doc(db, "users", user.uid),
        {
          displayName: validatedData.displayName,
          email: validatedData.email.toLowerCase(),
          createdAt: serverTimestamp(),
        },
        false
      ),
    ]);

    await firebaseSignOut(auth);
    return {
      success: true,
      message: "Verification email sent. Please check your inbox.",
    };
  } catch (error: any) {
    if (error instanceof ZodError) {
      throw new Error(getZodErrorMessage(error));
    }
    return handleAuthError(error);
  }
};

export const login = async (userData: LoginInput) => {
  const authManager = AuthStateManager.getInstance();

  try {
    const validatedData = loginSchema.parse(userData);

    if (authManager.isUserLockedOut(validatedData.email)) {
      throw new Error("Account is temporarily locked. Please try again later.");
    }

    const userCredential = await withRetry(() =>
      signInWithEmailAndPassword(
        auth,
        validatedData.email,
        validatedData.password
      )
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      await firebaseSignOut(auth);
      throw new Error("Please verify your email before logging in.");
    }

    authManager.recordLoginAttempt(validatedData.email, true);

    await updateUserData(doc(db, "users", user.uid), {});

    authManager.startSessionTimeout(() => {
      signOut();
    });

    return user;
  } catch (error: any) {
    if (error instanceof ZodError) {
      throw new Error(getZodErrorMessage(error));
    }

    if (
      error?.code === AuthErrorCodes.INVALID_PASSWORD ||
      error?.code === AuthErrorCodes.USER_DELETED
    ) {
      authManager.recordLoginAttempt(userData.email, false);
    }

    return handleAuthError(error);
  }
};

export const signInWithGoogle = async () => {
  const authManager = AuthStateManager.getInstance();

  try {
    const result = await withRetry(() =>
      signInWithPopup(auth, new GoogleAuthProvider())
    );

    const user = result.user;
    const userRef = doc(db, "users", user.uid);

    await updateUserData(userRef, {
      displayName: user.displayName,
      email: user.email,
      provider: "google",
    });

    authManager.startSessionTimeout(() => {
      signOut();
    });

    return user;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const resetPassword = async (resetData: ResetPasswordInput) => {
  try {
    const validatedData = resetPasswordSchema.parse(resetData);
    await withRetry(() => sendPasswordResetEmail(auth, validatedData.email));
    return {
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(getZodErrorMessage(error));
    }
    return handleAuthError(error);
  }
};

export const changePassword = async (
  user: User,
  currentPassword: string,
  newPassword: string
) => {
  try {
    if (!user.email) {
      throw new Error("User email not found");
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await withRetry(async () => {
      await reauthenticateWithCredential(user, credential);
      passwordChangeSchema.parse({
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      await updatePassword(user, newPassword);
    });
    return {
      success: true,
      message: "Password successfully updated.",
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(getZodErrorMessage(error));
    }
    return handleAuthError(error);
  }
};

export const resendVerificationEmail = async (user: User) => {
  try {
    await withRetry(() => sendEmailVerification(user));
    return {
      success: true,
      message: "Verification email resent. Please check your inbox.",
    };
  } catch (error) {
    return handleAuthError(error);
  }
};

export const signOut = async () => {
  const authManager = AuthStateManager.getInstance();

  try {
    await withRetry(() => firebaseSignOut(auth));
    authManager.clearSessionTimeout();
  } catch (error) {
    return handleAuthError(error);
  }
};

export const onAuthStateChanged = (cb: NextOrObserver<User>) => {
  return firebaseOnAuthStateChanged(auth, cb);
};

// Cleanup function for use in app shutdown
export const cleanup = () => {
  AuthStateManager.getInstance().cleanup();
};
