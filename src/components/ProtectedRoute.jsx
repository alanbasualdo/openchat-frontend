import { useEffect } from "react"
import { GetAllUsers, GetCurrentUser } from "../api/user"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useDispatch, useSelector } from "react-redux"
import { HideLoader, ShowLoader } from "../redux/loaderSlice"
import { SetAllChats, SetAllUsers, SetUser } from "../redux/userSlice"
import { GetAllChats } from "../api/chats"

export const ProtectedRoute = ({ children }) => {

    const { user } = useSelector(state => state.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const getCurrentUser = async () => {
        try {
            dispatch(ShowLoader())
            const response = await GetCurrentUser()
            const allresponse = await GetAllUsers()
            const chatsresponse = await GetAllChats()
            dispatch(HideLoader())
            if (response.success) {
                dispatch(SetUser(response.data))
                dispatch(SetAllUsers(allresponse.data))
                dispatch(SetAllChats(chatsresponse.data))
            } else {
                toast.error(response.message)
                navigate('/login')
            }
        } catch (error) {
            dispatch(HideLoader())
            toast.error(error.message)
            navigate('/login')
        }
    }

    useEffect(() => {
        if (localStorage.getItem('token')) {
            getCurrentUser()
        } else {
            navigate('/login')
        }
    }, [])

    return (
        <div className="h-screen w-screen bg-gray-200 p-2">
            <div className="flex justify-between p-5 bg-primary rounded">
                <div className="flex itema-center gap-1 text-white">
                    <i className="ri-message-3-line text-2xl"></i>
                    <h1 className="text-2xl uppercase font-bold">OpenChat</h1>
                </div>
                <div className="flex gap-1 text-md items-center text-white">
                    <i className="ri-user-3-fill"></i>
                    <h1 className="underline">{user?.name}</h1>
                    <i
                        className="ri-logout-circle-r-line ml-5 text-xl cursor-pointer"
                        onClick={() => {
                            localStorage.removeItem('token')
                            navigate('/login')
                        }}
                    >
                    </i>
                </div>
            </div>
            <div className="py-5">
                {children}
            </div>
        </div>
    )
}
