import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { RegisterUser } from "../api/user"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { HideLoader, ShowLoader } from "../redux/loaderSlice"

export const Register = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: ''
    })

    const register = async () => {
        try {
            dispatch(ShowLoader())
            const response = await RegisterUser(user)
            dispatch(HideLoader())
            if (response.success) {
                toast.success(response.message)
            } else {
                toast.success(response.message)
            }
        } catch (error) {
            dispatch(HideLoader())
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/')
        }
    }, [])

    return (
        <div className='h-screen bg-primary flex items-center justify-center'>
            <div className="bg-white shadow-md p-5 flex flex-col gap-5 w-96">
                <h1 className='text-2xl uppercase font-semibold text-primary'>
                    Register
                </h1>
                <hr />
                <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    placeholder="Enter your name"
                />
                <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    placeholder="Enter your email"
                />
                <input
                    type="password"
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    placeholder="Enter your password"
                />
                <button
                    className="contained-btn"
                    onClick={register}
                >
                    Register
                </button>

                <Link
                    to="/login"
                    className="underline"
                >
                    Already have an account?
                </Link>
            </div>
        </div>
    )
}