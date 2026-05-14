"use client";
 
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
  type User,
  signOut,
  linkWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { firebaseAuth, firestore } from "../firebase/FirebaseConfig";
import { useRouter } from "next/navigation";
 
export type UserRole = "admin" | "cliente";
 
interface UserData {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  telefono?: string;
  direccion?: string;
  active: boolean;
}
 
export const useFirebaseUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 
  // Lista de correos con permisos de administrador
  const adminEmails = ["admin@stic.com", "admin@example.com"];
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (loggedInUser) => {
        setLoading(true);
        if (loggedInUser) {
          setUser(loggedInUser);
 
          try {
            // Obtener datos adicionales del usuario desde Firestore
            const userDocRef = doc(firestore, "users", loggedInUser.uid);
            const userDoc = await getDoc(userDocRef);
 
            if (userDoc.exists()) {
              setUserData(userDoc.data() as UserData);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    );
 
    return () => unsubscribe();
  }, []);
 
  const isAdmin = (): boolean => {
    if (!user || !user.email) return false;
    if (userData?.role === "admin") return true;
    return adminEmails.includes(user.email);
  };
 
  const loginWithFirebase = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      console.log("User signed in:", userCredential.user);
 
      // Obtener datos del usuario
      const userDocRef = doc(firestore, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
 
      if (userDoc.exists()) {
        // Verificar si la cuenta está activa
        const userData = userDoc.data() as UserData;
        if (!userData.active) {
          await signOut(firebaseAuth);
          throw new Error(
            "Tu cuenta está desactivada. Contacta al administrador."
          );
        }
      }
 
      router.push("/");
      return userCredential.user;
    } catch (error: any) {
      console.error("Error signing in:", error.code, error.message);
      throw error;
    }
  };
 
  const registerWithFirebase = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "cliente",
    telefono: string = "",
    direccion: string = ""
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      const user = userCredential.user;
 
      await updateProfile(user, { displayName: fullName });
 
      // Crear documento en Firestore para almacenar información adicional
      const userData: UserData = {
        uid: user.uid,
        fullName,
        email,
        role: adminEmails.includes(email) ? "admin" : role,
        createdAt: new Date().toISOString(),
        telefono,
        direccion,
        active: true,
      };
 
      await setDoc(doc(firestore, "users", user.uid), userData);
 
      console.log("User registered with additional data:", userData);
      router.push("/");
      return user;
    } catch (error: any) {
      console.error("Error registering:", error.code, error.message);
      throw error;
    }
  };
 
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
 
      // Verificar si el usuario ya existe en Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
 
      if (!userDoc.exists()) {
        // Si es un nuevo usuario, crear registro en Firestore
        const userData: UserData = {
          uid: user.uid,
          fullName: user.displayName || "",
          email: user.email || "",
          role: adminEmails.includes(user.email || "") ? "admin" : "cliente",
          createdAt: new Date().toISOString(),
          active: true,
        };
 
        await setDoc(userDocRef, userData);
      } else {
        // Si el usuario existe, verificar que esté activo
        const userData = userDoc.data() as UserData;
        if (!userData.active) {
          await signOut(firebaseAuth);
          throw new Error(
            "Tu cuenta está desactivada. Contacta al administrador."
          );
        }
      }
 
      console.log("User signed in with Google:", user);
      router.push("/");
      return user;
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };
 
  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      console.log("User signed out successfully");
      setUser(null);
      setUserData(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };
 
  
 
  return {
    user,
    userData,
    loading,
    isAdmin,
    loginWithFirebase,
    registerWithFirebase,
    loginWithGoogle,
    logout,
  };
};
 