'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getRoleBasedRedirectPath } from '@/utils/roleRedirect';
import toast from 'react-hot-toast';

export type UserRole = 'admin' | 'doctor' | 'merchant' | 'user';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  specialization?: string; // For doctors
  merchantId?: string; // For merchants
  doctorId?: string; // For doctors
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role: UserRole, additionalData?: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
  redirectAfterLogin: (customRouter?: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Temporary storage for immediate redirection access
  let tempUserData: UserData | null = null;

  useEffect(() => {
    if (!auth) {
      console.error('Firebase auth is not initialized');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate(),
            } as UserData);
          } else {
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Starting sign in process for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in successfully:', userCredential.user.uid);
      
      // Fetch user data immediately after login
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let currentUserData: UserData;
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        currentUserData = {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as UserData;
        console.log('User data fetched from Firestore:', currentUserData);
        
        toast.success(`Welcome back, ${currentUserData.displayName}!`);
      } else {
        console.log('No user document found, creating default...');
        // If no user document exists, create a default one
        currentUserData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName: userCredential.user.displayName || email.split('@')[0],
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), currentUserData);
        console.log('Default user data created:', currentUserData);
        
        toast.success(`Welcome, ${currentUserData.displayName}!`);
      }
      
      // Set user data
      setUserData(currentUserData);
      tempUserData = currentUserData;
      
      // Immediate role-based redirection
      console.log('Redirecting user with role:', currentUserData.role);
      const redirectPath = getRoleBasedRedirectPath(currentUserData.role);
      console.log('Redirect path:', redirectPath);
      
      // Use window.location for reliable redirection
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 500);
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Failed to sign in';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          errorMessage = error.message || 'Failed to sign in';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole, additionalData?: any) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Update user profile
      await updateProfile(user, { displayName });

      // Create user document in Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role,
        phoneNumber: additionalData?.phoneNumber || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...additionalData
      };

      // Add role-specific fields
      if (role === 'doctor') {
        userData.doctorId = `DOC${Date.now()}`;
      } else if (role === 'merchant') {
        userData.merchantId = `MER${Date.now()}`;
      }

      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const updatedData = {
        ...data,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
      
      if (userData) {
        setUserData({ ...userData, ...updatedData });
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  const redirectAfterLogin = (customRouter?: any) => {
    if (typeof window === 'undefined') return;
    
    const userDataToUse = userData || tempUserData;
    console.log('Redirecting user with data:', userDataToUse);
    
    if (!userDataToUse) {
      console.log('No userData available for redirection, going to dashboard');
      if (customRouter) {
        customRouter.push('/dashboard');
      } else {
        window.location.href = '/dashboard';
      }
      return;
    }
    
    console.log('Redirecting user with role:', userDataToUse.role);
    const redirectPath = getRoleBasedRedirectPath(userDataToUse.role);
    console.log('Redirect path:', redirectPath);
    
    // Use Next.js router if available, otherwise fallback to window.location
    if (customRouter) {
      customRouter.push(redirectPath);
    } else {
      window.location.href = redirectPath;
    }
    
    // Clear temporary data
    tempUserData = null;
  };

  const value: AuthContextType = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    redirectAfterLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
