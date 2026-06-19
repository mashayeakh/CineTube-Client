'use client'
import { useEffect } from 'react'

export function BackendWarmer() {
    useEffect(() => {
        fetch('https://cinetube-backend-2.onrender.com/health', { cache: 'no-store' }).catch(() => { })
    }, [])
    return null
}