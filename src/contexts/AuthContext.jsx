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
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Fetch user data from Firestore
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
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
    return await signInWithEmail(email, password);
  };

  const signinWithGoogle = async () => {
    return await signInWithGoogle();
  };

  const signout = async () => {
    return await logout();
  };

  const updateProfile = async (data) => {
    if (currentUser) {
      await updateUserData(currentUser.uid, data);
      setUserData({ ...userData, ...data });
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

