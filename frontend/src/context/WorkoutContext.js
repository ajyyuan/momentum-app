import { createContext, useEffect, useReducer } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

export const WorkoutsContext = createContext()

export const workoutsReducer = (state, action) => {
    switch (action.type) {
        case 'SET_WORKOUTS':
            return {
                workouts: action.payload
            }
        case 'CREATE_WORKOUT':
            return {
                workouts: [action.payload, ...state.workouts]
            }
        case 'DELETE_WORKOUT':
            return {
                workouts: state.workouts.filter((w) =>
                    w._id ?
                    w._id !== action.payload._id :
                    w.id !== action.payload.id)
            }
        case 'UPDATE_WORKOUT':
            return {
                workouts: state.workouts.map((w) =>
                    w._id ?
                    (w._id === action.payload._id ? action.payload : w) :
                    w.id === action.payload.id ? action.payload : w)
            }
        default:
            return state
    }
}

export const WorkoutsContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(workoutsReducer, {
        workouts: null
    })

    const { user } = useAuthContext()

    // Load workouts from sessionStorage if not logged in
    useEffect(() => {
        const storedWorkouts = JSON.parse(sessionStorage.getItem('workouts')) || [];
        if (!user) {
            dispatch({ type: 'SET_WORKOUTS', payload: storedWorkouts })
        }
    }, [user])

    useEffect(() => {
        if (!user) {
            sessionStorage.setItem('guestWorkouts', JSON.stringify(state.workouts))
        }
    }, [state.workouts, user])

    return (
        <WorkoutsContext.Provider value={{...state, dispatch}}>
            { children }
        </WorkoutsContext.Provider>
    )
}