import { useState, useEffect } from 'react'
import { useWorkoutsContext } from '../hooks/useWorkoutsContext'
import { useAuthContext } from '../hooks/useAuthContext'

// components
import WorkoutDetails from '../components/WorkoutDetails'
import WorkoutForm from '../components/WorkoutForm'

const Home = () => {
    const { workouts, dispatch } = useWorkoutsContext()
    const { user } = useAuthContext()
    const [ loading, setLoading ] = useState(true) // workouts loading state

    useEffect(() => {
        const fetchWorkouts = async () => {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/workouts`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const json = await response.json()

            if (response.ok) {
                dispatch({type: 'SET_WORKOUTS', payload: json})
            }
            setLoading(false)
        }

        if (user) {
            fetchWorkouts()
        } else {
            setLoading(false)
        }
    }, [dispatch, user])

    return (
        <div className="home">
            <div className='workouts'>
                {loading
                    ? <div>Loading...</div>
                    : (workouts && workouts.length > 0
                        ? workouts.map((workout) => (
                            <WorkoutDetails
                                key={workout._id || workout.id}
                                workout={workout}
                            />))
                        : <div>Try adding a workout!</div>)
                }
            </div>
            <WorkoutForm />
        </div>
    )
}

export default Home