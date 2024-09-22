import { useState } from 'react'
import { useWorkoutsContext } from '../hooks/useWorkoutsContext'
import { useAuthContext } from '../hooks/useAuthContext'
import { v4 as uuidv4 } from 'uuid'

const WorkoutForm = () => {
    const { dispatch } = useWorkoutsContext()
    const { user } = useAuthContext()

    const [title, setTitle] = useState('')
    const [load, setLoad] = useState('')
    const [reps, setReps] = useState('')
    const [error, setError] = useState(null)
    const [emptyFields, setEmptyFields] = useState([])

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const workout = {
            id: uuidv4(),
            title,
            load,
            reps,
            createdAt: new Date().toISOString()
        }

        if (!user) {
            // Handle guest workout creation by adding it to sessionStorage
            const emptyFields = []
            if (!title) emptyFields.push('title')
            if (!load) emptyFields.push('load')
            if (!reps) emptyFields.push('reps')

            if (emptyFields.length > 0) {
                setError('Please fill in all the fields')
                setEmptyFields(emptyFields)
            } else {
                let guestWorkouts = JSON.parse(sessionStorage.getItem('guestWorkouts')) || []
                guestWorkouts.push(workout)
                sessionStorage.setItem('guestWorkouts', JSON.stringify(guestWorkouts))
    
                // Update the context
                dispatch({ type: 'CREATE_WORKOUT', payload: workout })
                setTitle('')
                setLoad('')
                setReps('')
                setError(null)
                setEmptyFields([])
            }
            
            // setError('You must be logged in')
        } else {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/workouts`, {
                method: 'POST',
                body: JSON.stringify(workout),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            })
            const json = await response.json()

            if (response.ok) {
                setTitle('')
                setLoad('')
                setReps('')
                setError(null)
                setEmptyFields([])
                console.log('new workout added', json)
                dispatch({type: 'CREATE_WORKOUT', payload: json})
            } else {
                setError(json.error)
                setEmptyFields(json.emptyFields)
            }
        }
    }

    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Add a New Workout</h3>

            <label>Exercise Title:</label>
            <input
                type="text"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                className={emptyFields.includes('title') ? 'error' : ''}
            />

            <label>Load:</label>
            <input
                type="number"
                onChange={(e) => setLoad(e.target.value)}
                value={load}
                className={emptyFields.includes('load') ? 'error' : ''}
            />

            <label>Reps:</label>
            <input
                type="number"
                onChange={(e) => setReps(e.target.value)}
                value={reps}
                className={emptyFields.includes('reps') ? 'error' : ''}
            />

            <button>Add Workout</button>
            {error && <div className="error">{error}</div>}

            {!user && (
                <div className='warning'>
                    <p>
                        <strong>Warning:</strong> Your workouts will be lost upon reload. <a href="/login">Log in</a> or <a href="/signup">sign up</a> to save your workouts.
                    </p>
                </div>
            )}
        </form>
    )
}

export default WorkoutForm