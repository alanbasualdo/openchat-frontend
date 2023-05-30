import { useSelector, useDispatch } from 'react-redux'
import { toast } from "react-hot-toast"
import { HideLoader, ShowLoader } from "../redux/loaderSlice"
import { SetAllChats, SetSelectedChat } from "../redux/userSlice"
import { CreateNewChat } from '../api/chats'
import moment from 'moment'
import { useEffect } from 'react'
import store from '../redux/store'

const getData = (allUsers, allChats, search, currentUserId) => {
    return allUsers.filter(
        (us) =>
            us._id !== currentUserId &&
            (
                (us.name.toLowerCase().includes(search.toLowerCase()) && search) ||
                allChats.some((chat) => chat.members.map((m) => m._id).includes(us._id))
            )
    )
}

export const UsersList = ({ search, socket, onlineUsers }) => {

    const { allUsers, allChats, user, selectedChat } = useSelector(({ user }) => user)
    const dispatch = useDispatch()

    const createNewChat = async (id) => {
        try {
            dispatch(ShowLoader())
            const response = await CreateNewChat([user._id, id])
            dispatch(HideLoader())
            if (response.success) {
                toast.success(response.message)
                const newChat = response.data
                const updateChats = [...allChats, newChat]
                dispatch(SetAllChats(updateChats))
                dispatch(SetSelectedChat(newChat))
            } else {
                toast.error(response.message)
            }
        } catch (error) {
            dispatch(HideLoader())
            toast.error(error.message)
        }
    }

    const openChat = (recId) => {
        const chat = allChats.find(
            (chat) =>
                chat.members.map((m) => m._id).includes(user._id) &&
                chat.members.map((m) => m._id).includes(recId)
        )
        if (chat) {
            dispatch(SetSelectedChat(chat))
        }
    }

    const getIsSelectedChat = (us) => {
        if (selectedChat) {
            return selectedChat.members.map((m) => m._id).includes(us._id)
        }
        return false
    }

    const getLastMsgPerson = (user) => {
        const chat = allChats.find(
            (chat) => chat.members.map((m) => m._id).includes(user._id)
        )
        if (!chat || !chat.lastMessage) {
            return ""
        } else {
            const lastMsgPerson = chat?.lastMessage?.sender === user._id
            return (
                <p className="mt-1 truncate text-sm leading-5 text-gray-500">
                    {lastMsgPerson} {chat?.lastMessage?.text}
                </p>
            )
        }
    }

    const getLastMsgTime = (user) => {
        const chat = allChats.find(
            (chat) => chat.members.map((m) => m._id).includes(user._id)
        )
        if (chat && chat.lastMessage && chat.lastMessage.createdAt) {
            return moment(chat.lastMessage.createdAt).format("hh:mm A")
        }
        return ''
    }

    const getUnreadMessages = (us) => {
        const chat = allChats.find((chat) =>
            chat.members.map((m) => m._id).includes(us._id)
        )
        if (chat && chat?.unreadMessages && chat?.lastMessage?.sender !== user._id) {
            return (
                <div className='bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                    {chat?.unreadMessages}
                </div>
            )
        }
    }

    useEffect(() => {
        socket.on('receive-message', (message) => {
            const tempSelectedChat = store.getState().user.selectedChat;
            const tempAllChats = store.getState().user.allChats;
            if (tempSelectedChat?._id !== message.chat) {
                const updateAllChats = tempAllChats.map((chat) => {
                    if (chat?._id === message.chat) {
                        return {
                            ...chat,
                            unreadMessages: (chat?.unreadMessages || 0) + 1,
                            lastMessage: message
                        };
                    }
                    return chat;
                });
                dispatch(SetAllChats(updateAllChats));
            }
        });
    }, []);

    const currentUserId = user ? user._id : null

    const users = getData(allUsers, allChats, search, currentUserId)

    return (
        <>
            {/* <div className="flex flex-col gap-3 mt-5 lg:w-96 xl:w-96 md:w-60 sm:w-60">
                {users.map((user) => {
                    return (
                        <div
                            className={`shadow-sm border p-3 rounded-xl bg-white flex justify-between items-center cursor-pointer
                        ${getIsSelectedChat(user) && "border-blue-500 border-2"}
                        `}
                            key={user._id}
                            onClick={() => openChat(user._id)}
                        >
                            <div className="flex gap-5 items-center">
                                {user.pic && (
                                    <img
                                        src={user.pic}
                                        alt="Profile pic"
                                        className="w-10 h-10 rounded-full"
                                    />
                                )}
                                {!user.pic && (
                                    <div className="bg-gray-500 text-white rounded-full h-10 w-10 flex items-center justify-center">
                                        <h1 className="uppercase text-xl font-semibold">
                                            {user.name[0]}
                                        </h1>
                                    </div>
                                )}
                                <div className='flex flex-col gap-1'>
                                    <div className='flex gap-1'>
                                        <div className="flex gap-1 items-center">
                                            <h1>{user.name}</h1>
                                            {onlineUsers.includes(user._id) && (
                                                <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                </div>
                                            )}
                                        </div>
                                        {getUnreadMessages(user)}
                                    </div>
                                    {getLastMsg(user)}
                                </div>
                            </div>
                            {!allChats.some(
                                (chat) =>
                                    chat.members.map((m) => m._id).includes(user._id) &&
                                    chat.members.map((m) => m._id).includes(user._id)
                            ) && (
                                    <div onClick={() => createNewChat(user._id)}>
                                        <button className="border-primary border text-primary bg-white px-3 py-1 rounded-md">
                                            Create Chat
                                        </button>
                                    </div>
                                )}

                        </div>
                    )
                })}
            </div>
 */}
            <ul role="list" className="divide-y mt-5 divide-gray-100">
                {users.map((user) => {
                    return (
                        <li
                            key={user._id}
                            className={`flex justify-between gap-x-6 rounded-xl p-5 cursor-pointer ${getIsSelectedChat(user) ? 'bg-gray-300' : 'hover:bg-gray-100'
                                }`}
                            onClick={() => openChat(user._id)}
                        >
                            <div className="flex gap-x-4">
                                {user.pic && (
                                    <img
                                        className="h-12 w-12 flex-none rounded-full bg-gray-50"
                                        src={user.pic}
                                        alt="Profile pic"
                                    />
                                )}
                                {!user.pic && (
                                    <div className="bg-gray-500 text-white rounded-full h-10 w-10 flex items-center justify-center">
                                        <h1 className="uppercase text-xl font-semibold">{user.name[0]}</h1>
                                    </div>
                                )}
                                <div className="min-w-0 flex-auto">
                                    <p className="text-sm font-semibold leading-6 text-gray-900">{user.name}</p>
                                    {getLastMsgPerson(user)}
                                </div>
                            </div>
                            <div className="hidden sm:flex sm:flex-col sm:items-end">
                                <div className="mt-1 flex items-center gap-x-1.5">
                                    {onlineUsers.includes(user._id) ? (
                                        <>
                                            <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            </div>
                                            <p className="text-xs leading-5 text-gray-500">Online</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex-none rounded-full bg-red-500/20 p-1">
                                                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                            </div>
                                            <p className="text-xs leading-5 text-gray-500">Offline</p>
                                        </>
                                    )}
                                </div>
                                {getUnreadMessages(user)}
                                <p className="mt-1 truncate text-xs leading-5 text-gray-500">{getLastMsgTime(user)}</p>
                            </div>
                            {!allChats.some(
                                (chat) =>
                                    chat.members.map((m) => m._id).includes(user._id) &&
                                    chat.members.map((m) => m._id).includes(user._id)
                            ) && (
                                    <div onClick={() => createNewChat(user._id)}>
                                        <button className="border-primary border text-primary bg-white px-3 py-1 rounded-md">
                                            Create Chat
                                        </button>
                                    </div>
                                )}
                        </li>
                    )
                })}
            </ul>
        </>
    )
}