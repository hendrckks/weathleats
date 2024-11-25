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
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  updatePassword,
  AuthErrorCodes,
  setPersistence,
  browserSessionPersistence,
  UserCredential,
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
  getDoc,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./clientApp";
import {
  SignUpInput,
  LoginInput,
  ResetPasswordInput,
  User,
  signUpSchema,
  loginSchema,
  resetPasswordSchema,
  passwordChangeSchema,
  getZodErrorMessage,
} from "../../types/auth";
import { ZodError } from "zod";

// Configuration
const CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  SESSION_CHECK_INTERVAL: 60000, // 1 minute
  SESSION_DURATION: 2 * 60 * 60 * 1000, // 2 hours
} as const;

// Types
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

  async startSessionTimeout(_user: User) {
    this.clearSessionTimeout();

    // Set session persistence
    await setPersistence(auth, browserSessionPersistence);

    // Set session expiration time
    const expirationTime = Date.now() + CONFIG.SESSION_DURATION;
    localStorage.setItem("sessionExpiration", expirationTime.toString());

    this.sessionTimeout = setTimeout(() => {
      this.signOut();
    }, CONFIG.SESSION_DURATION);
  }

  clearSessionTimeout() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
    localStorage.removeItem("sessionExpiration");
  }

  async checkSession(): Promise<boolean> {
    const expirationTime = localStorage.getItem("sessionExpiration");
    if (expirationTime) {
      if (Date.now() > parseInt(expirationTime)) {
        await this.signOut();
        return false;
      }
      return true;
    }
    return false;
  }

  async signOut() {
    try {
      await firebaseSignOut(auth);
      this.clearSessionTimeout();
    } catch (error) {
      console.error("Error signing out:", error);
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

export const signUp = async (userData: SignUpInput) => {
  try {
    const validatedData = signUpSchema.parse(userData);

    // Check if email exists in users collection
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
    const createdAt = serverTimestamp();

    await Promise.all([
      sendEmailVerification(user),
      updateProfile(user, {
        displayName: validatedData.displayName,
      }),
      setDoc(doc(db, "users", user.uid), {
        displayName: validatedData.displayName,
        email: validatedData.email.toLowerCase(),
        createdAt: createdAt,
        favorites: [],
      }),
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

export const login = async (
  loginData: LoginInput,
  setUser: (user: User | null) => void
): Promise<User> => {
  const authManager = AuthStateManager.getInstance();

  try {
    const validatedData = loginSchema.parse(loginData);

    if (authManager.isUserLockedOut(validatedData.email)) {
      throw new Error("Account is temporarily locked. Please try again later.");
    }

    // Check if the email exists in the users collection
    const usersRef = collection(db, "users");
    const emailQuery = query(
      usersRef,
      where("email", "==", validatedData.email.toLowerCase())
    );
    const querySnapshot = await getDocs(emailQuery);

    if (querySnapshot.empty) {
      throw new Error(
        "This email is not registered. Please sign up to use it."
      );
    }

    const userCredential: UserCredential = await withRetry(() =>
      signInWithEmailAndPassword(
        auth,
        validatedData.email,
        validatedData.password
      )
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      await auth.signOut();
      throw new Error("Please verify your email before logging in.");
    }

    authManager.recordLoginAttempt(validatedData.email, true);

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    const userWithMetadata: User = {
      ...user,
      createdAt:
        userData?.createdAt instanceof Timestamp
          ? userData.createdAt.toDate().toISOString()
          : undefined,
    };

    await authManager.startSessionTimeout(userWithMetadata);

    // Update the user state immediately
    setUser(userWithMetadata);

    return userWithMetadata;
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      throw new Error(getZodErrorMessage(error));
    }

    if (
      error instanceof Error &&
      (error.name === AuthErrorCodes.INVALID_PASSWORD ||
        error.name === AuthErrorCodes.USER_DELETED)
    ) {
      authManager.recordLoginAttempt(loginData.email, false);
    }

    return handleAuthError(error);
  }
};

export const signInWithGoogle = async (
  setUser: (user: User | null) => void
) => {
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

    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    const userWithMetadata: User = {
      ...user,
      createdAt: userData?.createdAt?.toDate().toISOString(),
    };
    await authManager.startSessionTimeout(userWithMetadata);

    // Update the user state immediately
    setUser(userWithMetadata);

    return userWithMetadata;
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
  await authManager.signOut();
};

export const onAuthStateChanged = (cb: NextOrObserver<User>) => {
  return firebaseOnAuthStateChanged(auth, cb);
};

export const checkSession = async (): Promise<boolean> => {
  const authManager = AuthStateManager.getInstance();
  return authManager.checkSession();
};

// Cleanup function for use in app shutdown
export const cleanup = () => {
  AuthStateManager.getInstance().cleanup();
};
