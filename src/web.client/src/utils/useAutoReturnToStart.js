import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const useAutoReturnToStart = (startRoute = '/') => {
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const handleUserInteraction = () => {
            if (location.pathname !== startRoute) {
                navigate(startRoute)
            }
        }


     
    window.addEventListener('mousemove', handleUserInteraction)
    window.addEventListener('mousedown', handleUserInteraction)
    window.addEventListener('touchstart', handleUserInteraction)


    return () => {
        window.removeEventListener('mousemove', handleUserInteraction)
        window.removeEventListener('mousedown', handleUserInteraction)
        window.removeEventListener('touchstart', handleUserInteraction)
    }
    }, [location, navigate, startRoute])
}

export default useAutoReturnToStart;