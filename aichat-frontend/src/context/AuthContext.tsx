// context/AuthContext.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import Cookies from "js-cookie"
import axios from "axios"

type User = {
    id: string
    email: string
    name: string
}

type AuthContextType = {
    user: User | null
    isAuthenticated: boolean
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // 🔹 Runs once on app start / page refresh
    useEffect(() => {
        const token = Cookies.get("access_token")
        if (!token) {
            setLoading(false)
            return
        }

        // Fetch user profile from backend using token
        axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    // 🔹 Login helper
    const login = async (email: string, password: string) => {
        const res = await axios.post("/api/auth/login", { email, password })

        Cookies.set("access_token", res.data.accessToken, {
            secure: true,
            sameSite: "strict"
        })

        setUser(res.data.user) // stores user in state
    }

    // 🔹 Logout helper
    const logout = async () => {
        await axios.post("/api/auth/logout")
        Cookies.remove("access_token")
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
        user,
            isAuthenticated: !!user,
            loading,
            login,
            logout
    }}>
    {children}
    </AuthContext.Provider>
)
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}
