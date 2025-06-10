import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    auth: boolean;
    user: any | null;
    login: (token: string, user: any, rememberMe: boolean) => void;
    logout: () => void;
    checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<boolean>(false);
    const [user, setUser] = useState<any | null>(null);
    const [sessionChecker, setSessionChecker] = useState<NodeJS.Timeout | null>(null);
    const navigate = useNavigate();

    const checkSession = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8000/api/v1/user', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Session expired');

        } catch (error) {
            logout();
            navigate('/login');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");
        const rememberMe = localStorage.getItem("rememberMe") === 'true';

        if (token && storedUser) {
            setAuth(true);
            setUser(JSON.parse(storedUser));

            if (!rememberMe) {
                const interval = setInterval(checkSession, 5 * 60 * 1000);
                setSessionChecker(interval);
            }
        }

        return () => {
            if (sessionChecker) clearInterval(sessionChecker);
        };
    }, []);

    const login = (token: string, user: any, rememberMe: boolean = false) => {
        localStorage.setItem("access_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("rememberMe", rememberMe.toString());
        setAuth(true);
        setUser(user);

        if (!rememberMe) {
            const interval = setInterval(checkSession, 5 * 60 * 1000);
            setSessionChecker(interval);
        }
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("rememberMe");
        setAuth(false);
        setUser(null);
        if (sessionChecker) clearInterval(sessionChecker);
    };

    return (
        <AuthContext.Provider value={{ auth, user, login, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth يجب أن يكون داخل AuthProvider");
    }
    return context;
};