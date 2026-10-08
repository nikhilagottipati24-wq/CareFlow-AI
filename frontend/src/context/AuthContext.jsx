import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPatient, updatePatient as apiUpdatePatient, loginUser } from '../api';

const AuthContext = createContext(null);

const DEFAULT_PATIENT = {
  id: 'pat-001',
  name: 'Alex Johnson',
  age: 52,
  gender: 'Male',
  hospital: 'Synthetic General Hospital',
  discharge_date: 'October 14, 2026',
  mrn: 'SYN-883921'
};

const DEFAULT_USER = {
  id: 'usr-patient-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@patient.synthetic.org',
  role: 'patient',
  token: 'mock-session-token-123'
};

export function AuthProvider({ children }) {
  const [patient, setPatientState] = useState(() => {
    const saved = localStorage.getItem('careflow_patient');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_PATIENT;
  });

  const [user, setUserState] = useState(() => {
    const saved = localStorage.getItem('careflow_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return DEFAULT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const openNameModal = () => setIsNameModalOpen(true);
  const closeNameModal = () => setIsNameModalOpen(false);

  // Sync initial patient state with backend on mount without overwriting custom names
  useEffect(() => {
    const saved = localStorage.getItem('careflow_patient');
    let localPatient = null;
    if (saved) {
      try { localPatient = JSON.parse(saved); } catch (e) { }
    }

    getPatient()
      .then((backendPatient) => {
        if (localPatient && localPatient.name && localPatient.name !== 'Alex Johnson') {
          apiUpdatePatient({
            name: localPatient.name,
            age: localPatient.age,
            hospital: localPatient.hospital
          }).catch(() => {});
          setPatientState(localPatient);
        } else if (backendPatient && backendPatient.name) {
          setPatientState((prev) => {
            const merged = { ...prev, ...backendPatient };
            localStorage.setItem('careflow_patient', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch((err) => console.log('Patient sync notice:', err.message));
  }, []);

  // Update patient name across the entire application and backend
  const updatePatientName = async (newName) => {
    if (!newName || !newName.trim()) return;
    const trimmed = newName.trim();

    // 1. Update state immediately
    const updatedPatient = { ...patient, name: trimmed };
    setPatientState(updatedPatient);
    localStorage.setItem('careflow_patient', JSON.stringify(updatedPatient));

    if (user) {
      const updatedUser = { ...user, name: trimmed };
      setUserState(updatedUser);
      localStorage.setItem('careflow_user', JSON.stringify(updatedUser));
    }

    // 2. Sync with backend
    try {
      await apiUpdatePatient({ name: trimmed });
    } catch (err) {
      console.error('Failed to sync patient name with backend:', err);
    }
  };

  // Update full patient profile details
  const updatePatientDetails = async (fields) => {
    const updated = { ...patient, ...fields };
    if (fields.name) {
      updated.name = fields.name.trim();
    }
    setPatientState(updated);
    localStorage.setItem('careflow_patient', JSON.stringify(updated));

    if (fields.name && user) {
      const updatedUser = { ...user, name: fields.name.trim() };
      setUserState(updatedUser);
      localStorage.setItem('careflow_user', JSON.stringify(updatedUser));
    }

    try {
      await apiUpdatePatient(fields);
    } catch (err) {
      console.error('Failed to update patient on backend:', err);
    }
  };

  // Login handler (kept for mock compatibility, isAuthenticated always true)
  const login = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      const loggedUser = res.user;
      const activePatient = res.patient || patient;

      setUserState(loggedUser);
      setPatientState(activePatient);
      setIsAuthenticated(true);

      localStorage.setItem('careflow_user', JSON.stringify(loggedUser));
      localStorage.setItem('careflow_patient', JSON.stringify(activePatient));
      localStorage.setItem('careflow_authenticated', 'true');

      return { success: true, user: loggedUser, patient: activePatient };
    } catch (err) {
      const name = credentials.patient_name || (credentials.role === 'coordinator' ? 'Nurse Sarah Jenkins, RN' : (patient?.name || 'Alex Johnson'));
      const fallbackUser = {
        id: `usr-${Date.now()}`,
        name: name,
        email: credentials.email || 'alex@patient.synthetic.org',
        role: credentials.role || 'patient',
        token: `mock-token-${Date.now()}`
      };
      const fallbackPatient = {
        ...patient,
        name: credentials.patient_name || patient.name
      };

      setUserState(fallbackUser);
      setPatientState(fallbackPatient);
      setIsAuthenticated(true);

      localStorage.setItem('careflow_user', JSON.stringify(fallbackUser));
      localStorage.setItem('careflow_patient', JSON.stringify(fallbackPatient));
      localStorage.setItem('careflow_authenticated', 'true');

      return { success: true, user: fallbackUser, patient: fallbackPatient };
    }
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(true);
  };

  // Initials generator (e.g. "Alex Johnson" -> "AJ")
  const getInitials = (nameStr) => {
    if (!nameStr) return 'AJ';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patient,
        isAuthenticated,
        isNameModalOpen,
        setIsNameModalOpen,
        openNameModal,
        closeNameModal,
        login,
        logout,
        updatePatientName,
        updatePatientDetails,
        getInitials
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
