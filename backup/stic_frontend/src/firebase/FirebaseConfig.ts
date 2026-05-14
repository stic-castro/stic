import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import * as firebaseui from "firebaseui";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
    apiKey: "AIzaSyDYDVxJ9T1geAh1hHy2ynG_eZVuIM4dM1U",
    authDomain: "stic-ae008.firebaseapp.com",
    projectId: "stic-ae008",
    storageBucket: "stic-ae008.firebasestorage.app",
    messagingSenderId: "181878429356",
    appId: "1:181878429356:web:60586a294e0e03d0d17109",
    measurementId: "G-0TN9XGBJEY"
  };

// Initialize Firebase (servicios que funcionan en servidor y cliente)
export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);

// Variables para servicios que solo funcionan en el cliente
export let firebaseAnalytics: any = null;
export let firebaseUi: any = null;

// Función para inicializar servicios del lado del cliente
export function initClientFirebase() {
  if (typeof window !== 'undefined') {
    // Importar dinámicamente
    import('firebase/analytics').then(({ getAnalytics }) => {
      firebaseAnalytics = getAnalytics(firebaseApp);
    }).catch(error => console.error('Error cargando analytics:', error));

    import('firebaseui').then((firebaseui) => {
      firebaseUi = new firebaseui.auth.AuthUI(firebaseAuth);
      firebaseAuth.useDeviceLanguage();
    }).catch(error => console.error('Error cargando firebaseUI:', error));
  }
}