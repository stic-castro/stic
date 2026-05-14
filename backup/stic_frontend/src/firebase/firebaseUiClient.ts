'use client'

import * as firebaseui from 'firebaseui'
import { firebaseAuth } from './FirebaseConfig'

export const firebase_Ui = new firebaseui.auth.AuthUI(firebaseAuth)