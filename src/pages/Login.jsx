import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LoginUser } from "../api/user"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { HideLoader, ShowLoader } from "../redux/loaderSlice"

export const Login = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [user, setUser] = useState({
        email: '',
        password: ''
    })

    const login = async () => {
        try {
            dispatch(ShowLoader())
            const response = await LoginUser(user)
            dispatch(HideLoader())
            if (response.success) {
                toast.success(response.message)
                localStorage.setItem('token', response.data)
                navigate('/')
            } else {
                toast.error(response.message)
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
        <div className='h-screen bg-blue-600 flex items-center justify-center'>
            <div className="bg-white shadow-md p-5 flex flex-col gap-5 w-96">
                <h1 className='text-2xl uppercase font-semibold text-primary'>
                    Login
                </h1>
                <hr />
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
                    onClick={login}
                >
                    Login
                </button>

                <Link
                    to="/register"
                    className="underline"
                >
                    Don't have an account?
                </Link>
            </div>
        </div>
    )
}