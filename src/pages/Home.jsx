import { Chat } from '../components/Chat'
import { Search } from '../components/Search'
import { useEffect, useState } from "react"
import { UsersList } from '../components/UsersList'
import { useSelector } from 'react-redux'
import { io } from "socket.io-client"

const socket = io("http://localhost:5000")

export const Home = () => {

    const [search, setSearch] = useState("")
    const { selectedChat, user } = useSelector(state => state.user)
    const [onlineUsers, setOnlineUsers] = useState([])

    useEffect(() => {
        if (user) {
            socket.emit('join-room', user._id)
            socket.emit("came-online", user._id)
            socket.on("online-users-updated", (users) => {
                setOnlineUsers(users)
            })

            socket.on("went-offline", (userId) => {
                setOnlineUsers(prevUsers => prevUsers.filter(user => user !== userId))
            })
        }

        const handleBeforeUnload = () => {
            // Ejecutar la desconexión del socket
            socket.disconnect();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [user]);


    return (
        <div className='flex gap-5'>
            <div className='w-96'>
                <Search
                    search={search}
                    setSearch={setSearch}
                />
                <UsersList
                    search={search}
                    socket={socket}
                    onlineUsers={onlineUsers}
                />
            </div>
            {selectedChat && (
                <div className='w-full'>
                    <Chat socket={socket} />
                </div>
            )}

            {!selectedChat && (
                <div className="w-full h-[80vh]  items-center justify-center flex bg-white flex-col">
                    <h1 className="text-2xl font-semibold text-gray-500">
                        Seleccione un usuario
                    </h1>
                </div>
            )}
        </div>
    )
}