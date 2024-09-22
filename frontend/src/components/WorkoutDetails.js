import { useWorkoutsContext } from '../hooks/useWorkoutsContext'
import { useAuthContext } from '../hooks/useAuthContext'

// date fns
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const WorkoutDetails = ({ workout }) => {
    const { dispatch } = useWorkoutsContext()
    const { user } = useAuthContext()

    const handleClick = async () => {
        if (!user) {
            // Handle guest workout deletion
            let guestWorkouts = JSON.parse(sessionStorage.getItem('guestWorkouts')) || []

            // Filter workouts based on properties (guestWorkouts have no id)
            const filteredGuestWorkouts = guestWorkouts.filter((w) =>
                w.id !== workout.id
            )

            sessionStorage.setItem('guestWorkouts', JSON.stringify(filteredGuestWorkouts))

            dispatch({ type: 'DELETE_WORKOUT', payload: workout })
        } else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/workouts/` + workout._id, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const json = await response.json()

            if (response.ok) {
                dispatch({type: 'DELETE_WORKOUT', payload: json})
            }
        }
    }

    return (
        <div className="workout-details">
            <h4>{workout.title}</h4>
            <p><strong>Load (kg): </strong>{workout.load}</p>
            <p><strong>Reps: </strong>{workout.reps}</p>
            <p>{workout.createdAt ? formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true }) : 'No date available'}</p>
            <span className='material-symbols-outlined' onClick={handleClick}>delete</span>
        </div>
    )
}

export default WorkoutDetails