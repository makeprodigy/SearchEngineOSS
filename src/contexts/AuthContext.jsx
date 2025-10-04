import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  logout,
  getUserData,
  updateUserData 
} from '../services/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Check localStorage for immediate authentication status
  const getInitialUserData = () => {
    const isAuth = localStorage.getItem('isAuthenticated');
    const localUserData = localStorage.getItem('userData');
    if (isAuth === 'true' && localUserData) {
      try {
        return JSON.parse(localUserData);
      } catch (error) {
        console.error('Error parsing localStorage userData:', error);
      }
    }
    return null;
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(getInitialUserData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only set up auth listener if Firebase is configured
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
          
          // If no data in Firestore but we have localStorage data, sync it
          if (!data) {
            const localData = localStorage.getItem('userData');
            if (localData) {
              try {
                const parsedData = JSON.parse(localData);
                await updateUserData(user.uid, parsedData);
                setUserData(parsedData);
                console.log('✅ Synced localStorage data to Firebase');
              } catch (error) {
                console.error('Error syncing localStorage to Firebase:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, displayName) => {
    return await signUpWithEmail(email, password, displayName);
  };

  const signin = async (email, password) => {
    const result = await signInWithEmail(email, password);
    localStorage.setItem('isAuthenticated', 'true');
    return result;
  };

  const signinWithGoogle = async () => {
    const result = await signInWithGoogle();
    localStorage.setItem('isAuthenticated', 'true');
    return result;
  };

  const signout = async () => {
    // Clear localStorage authentication
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setUserData(null);
    
    return await logout();
  };

  const updateProfile = async (data) => {
    // Update localStorage immediately
    try {
      const existingData = localStorage.getItem('userData');
      const currentData = existingData ? JSON.parse(existingData) : {};
      const updatedData = { ...currentData, ...data };
      localStorage.setItem('userData', JSON.stringify(updatedData));
      setUserData(updatedData);
      console.log('✅ Profile updated in localStorage');
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }

    // Sync to Firebase if user is authenticated
    if (currentUser) {
      try {
        await updateUserData(currentUser.uid, data);
        console.log('✅ Profile synced to Firebase');
      } catch (error) {
        console.error('Error syncing to Firebase (will retry later):', error);
      }
    } else {
      console.log('ℹ️ User not authenticated yet, will sync to Firebase once logged in');
    }
  };

  const refreshUserData = async () => {
    if (currentUser) {
      const data = await getUserData(currentUser.uid);
      setUserData(data);
    }
  };

  const value = {
    currentUser,
    userData,
    signup,
    signin,
    signinWithGoogle,
    signout,
    updateProfile,
    refreshUserData,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

