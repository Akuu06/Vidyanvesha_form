import { auth } from "@/config/firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    User,
    onAuthStateChanged,
} from "firebase/auth";

export const firebaseService = {
    // ===============================
    // EMAIL + PASSWORD LOGIN
    // ===============================
    async login(email: string, password: string): Promise<User> {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return result.user;
        } catch (error) {
            throw error;
        }
    },

    // ===============================
    // GOOGLE LOGIN
    // ===============================
    async loginWithGoogle(): Promise<User> {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (error) {
            throw error;
        }
    },

    // ===============================
    // REGISTER (EMAIL + PASSWORD)
    // ===============================
    async register(
        email: string,
        password: string,
        displayName?: string
    ): Promise<User> {
        try {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Optional: set display name
            if (displayName) {
                await updateProfile(result.user, { displayName });
            }

            return result.user;
        } catch (error) {
            throw error;
        }
    },

    // ===============================
    // UPDATE USER PROFILE
    // ===============================
    async updateUserProfile(displayName: string): Promise<void> {
        try {
            if (!auth.currentUser) {
                throw new Error("No authenticated user");
            }

            await updateProfile(auth.currentUser, { displayName });
        } catch (error) {
            throw error;
        }
    },

    // ===============================
    // LOGOUT
    // ===============================
    async logout(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            throw error;
        }
    },

    // ===============================
    // GET CURRENT USER
    // ===============================
    getCurrentUser(): User | null {
        return auth.currentUser;
    },

    getUserAccessToken: async (
        forceRefresh: boolean = false
    ): Promise<string | null> => {
        let user = auth.currentUser;

        // If user is not immediately available, wait for auth state to resolve
        if (!user) {
            user = await new Promise<User | null>((resolve) => {
                const unsubscribe = onAuthStateChanged(auth, (u) => {
                    unsubscribe();
                    resolve(u);
                });
            });
        }

        if (user) {
            try {
                console.log("user", user)
                return await user.getIdToken(forceRefresh);
            } catch (error) {
                console.error("Error getting access token:", error);
                return null;
            }
        }
        return null;
    },

    getUserData: async (uid: string): Promise<any> => {
        // Stub for fetching extended user data
        return null;
    },
};