import { useState } from 'react';
import { useWorkoutsContext } from '../hooks/useWorkoutsContext'
import { useAuthContext } from '../hooks/useAuthContext'

// date fns
import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const WorkoutDetails = ({ workout }) => {
    const { dispatch } = useWorkoutsContext()
    const { user } = useAuthContext()
    const [editMode, setEditMode] = useState(false)
    const [newTitle, setNewTitle] = useState(workout.title)
    const [newLoad, setNewLoad] = useState(workout.load)
    const [newReps, setNewReps] = useState(workout.reps)

    const handleDelete = async () => {
        if (!user) {
            // Handle guest workout deletion
            let guestWorkouts = JSON.parse(sessionStorage.getItem('guestWorkouts')) || []

            // Filter workouts based on 'id' (not '_id')
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

    const handleEdit = async () => {
        const updatedWorkout = {
            ...workout,
            title: newTitle,
            load: newLoad,
            reps: newReps
        }
    
        if (!user) {
            // Update guest workouts in sessionStorage
            let guestWorkouts = JSON.parse(sessionStorage.getItem('guestWorkouts')) || []

            const updatedGuestWorkouts = guestWorkouts.map((w) =>
                w.id === workout.id ? updatedWorkout : w
            )

            sessionStorage.setItem('guestWorkouts', JSON.stringify(updatedGuestWorkouts))

            dispatch({ type: 'UPDATE_WORKOUT', payload: updatedWorkout })
        } else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/workouts/` + workout._id, {
                method: 'PATCH',
                body: JSON.stringify(updatedWorkout),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const json = await response.json()

            if (response.ok) {
                dispatch({ type: 'UPDATE_WORKOUT', payload: json })

                // Refetch workouts after edit
                const fetchUpdatedWorkouts = async () => {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/workouts`, {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    })
                    const updatedWorkouts = await response.json()
                    if (response.ok) {
                        dispatch({ type: 'SET_WORKOUTS', payload: updatedWorkouts })
                    }
                }
                fetchUpdatedWorkouts() // Trigger the refetch
            }
        }
    
        setEditMode(false);
    };
    
    return (
        <div className="workout-details">
            {editMode ? (
                <>
                    <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    <input type="number" value={newLoad} onChange={(e) => setNewLoad(e.target.value)} />
                    <input type="number" value={newReps} onChange={(e) => setNewReps(e.target.value)} />
                    <button className="material-symbols-outlined" onClick={handleEdit}>Check</button>
                    <button className="material-symbols-outlined" onClick={handleDelete}>Delete</button>
                </>
            ) : (
                <>
                    <h4>{workout.title}</h4>
                    <p><strong>Load (kg): </strong>{workout.load}</p>
                    <p><strong>Reps: </strong>{workout.reps}</p>
                    <p>{workout.createdAt ? formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true }) : 'No date available'}</p>
                    <span className="material-symbols-outlined" onClick={() => setEditMode(true)}>Edit</span>
                </>
            )}
        </div>
    );
};

export default WorkoutDetails