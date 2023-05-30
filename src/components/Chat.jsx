import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import { GetMessages, SendMessage } from '../api/messages'
import moment from 'moment'
import { SetAllChats } from '../redux/userSlice'
import { ClearChatMessages } from '../api/chats'
import store from '../redux/store'

export const Chat = ({ socket }) => {

  const dispatch = useDispatch()
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isRec, setIsRec] = useState(false)
  const [isReceipentTyping, setIsReceipentTyping] = useState(false)
  const { allChats, selectedChat, user } = useSelector((state) => state.user)
  const recUser = selectedChat.members.find((m) => m._id !== user._id)

  const sendNewMessage = async (image) => {
    try {
      const message = {
        chat: selectedChat._id,
        sender: user._id,
        text: newMessage,
        image
      }
      socket.emit('send-message', {
        ...message,
        members: selectedChat.members.map((m) => m._id),
        createdAt: moment().toISOString(),
        read: false,
      })
      const response = await SendMessage(message);
      if (response.success) {
        setNewMessage('')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getMessages = async () => {
    try {
      const response = await GetMessages(selectedChat._id)
      if (response.success) {
        setMessages(response.data)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const clearUnreadMessages = async () => {
    try {
      socket.emit('clear-unread-messages', {
        chat: selectedChat._id,
        members: selectedChat.members.map((m) => m._id),
        read: true,
      })
      const response = await ClearChatMessages(selectedChat._id)
      if (response.success) {
        const updateChats = allChats.map((chat) => {
          if (chat._id === selectedChat._id) {
            return response.data
          }
          return chat
        })
        dispatch(SetAllChats(updateChats))
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getMessages()
    if (selectedChat?.lastMessage?.sender !== user._id) {
      clearUnreadMessages()
    }

    socket.off('receive-message').on('receive-message', (message) => {
      const tempSelectedChat = store.getState().user.selectedChat
      if (tempSelectedChat._id === message.chat) {
        setMessages((messages) => [...messages, message])
      }
      if (tempSelectedChat._id === message.chat && message.sender !== user._id) {
        clearUnreadMessages()
      }
    })

    socket.on('unread-messages-cleared', (data) => {
      const tempAllChats = store.getState().user.allChats
      const tempSelectedChat = store.getState().user.selectedChat

      if (data.chat === tempSelectedChat._id) {
        const updatedChats = tempAllChats.map((chat) => {
          if (chat._id === data.chat) {
            return {
              ...chat,
              unreadMessages: 0,
            }
          }
          return chat
        })
        dispatch(SetAllChats(updatedChats))

        setMessages((prevMessages) => {
          return prevMessages.map((message) => {
            return {
              ...message,
              read: true,
            }
          })
        })
      }
    })

    socket.on('started-typing', (data) => {
      const selectedChat = store.getState().user.selectedChat
      if (data.chat === selectedChat._id && data.sender !== user._id) {
        setIsRec(true)
      }
      setTimeout(() => {
        setIsRec(false)
      }, 1500)
    })
  }, [selectedChat])

  useEffect(() => {
    const messagesContainer = document.getElementById("messages")
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }, [messages, isReceipentTyping])

  const onUploadImageClick = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader(file)
    reader.readAsDataURL(file)
    reader.onloadend = async () => {
      sendNewMessage(reader.result)
    }
  }

  return (
    <div className="bg-white h-[82vh] border rounded-2xl w-full flex flex-col justify-between p-5">

      <div>
        <div className="flex gap-5 items-center mb-2">
          {recUser.pic && (
            <img
              src={recUser.pic}
              alt="Profile pic"
              className="w-10 h-10 rounded-full"
            />
          )}
          {!recUser.pic && (
            <div className="bg-gray-500  rounded-full h-10 w-10 flex items-center justify-center">
              <h1 className="uppercase text-xl font-semibold text-white">
                {recUser.name[0]}
              </h1>
            </div>
          )}
          <h1>{recUser.name}</h1>
        </div>
        <hr />
      </div>

      <div className="h-[55vh] overflow-y-scroll p-5" id="messages">
        <div className="flex flex-col gap-2">
          {messages.map((message, index) => {
            const isCurrentUserSender = message.sender === user._id
            return (
              <div key={index} className={`flex ${isCurrentUserSender && 'justify-end'}`}>
                <div className='flex flex-col gap-1'>
                  {message.text && (
                    <h1
                      className={`${isCurrentUserSender
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-gray-300 text-black rounded-tl-none"
                        } p-2 rounded-xl`}
                    >
                      {message.text}
                    </h1>
                  )}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="message image"
                      className="w-24 h-24 rounded-xl"
                    />
                  )}
                  <h1 className='text-gray-400 text-sm'>
                    {moment(message.createdAt).format("hh:mm A")}
                  </h1>
                </div>
                {isCurrentUserSender && message.read ? (
                  <div className="p-2">
                    <i className="ri-check-double-line text-primary"></i>
                  </div>
                ) : (
                  <div className="p-2">
                    <i className="ri-check-double-line"></i>
                  </div>
                )}
              </div>
            )
          })}
          {isRec && (
            <div className="pb-10">
              <h1 className="bg-gray-300 text-black rounded-tl-none p-2 rounded-xl w-max">
                escribiendo...
              </h1>
            </div>
          )}
        </div>
      </div>

      <div className="h-18 rounded-xl border-gray-300 shadow border flex justify-between p-2 items-center relative">

        <div className="flex gap-2 text-xl">
          <label>
            <i className="ri-link cursor-pointer text-xl" typeof="file"></i>
            <input
              type="file"
              id="file"
              style={{
                display: "none",
              }}
              accept="image/gif,image/jpeg,image/jpg,image/png"
              onChange={onUploadImageClick}
            />
          </label>
          <i
            className="ri-emotion-line cursor-pointer text-xl"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          ></i>
        </div>

        <input
          type="text"
          placeholder="Type a message"
          className="w-[90%] border-0 h-full rounded-xl focus:border-none"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value)
            socket.emit("typing", {
              chat: selectedChat._id,
              members: selectedChat.members.map((mem) => mem._id),
              sender: user._id,
            })
          }}
        />
        <button
          className="bg-primary text-white py-1 px-5 rounded h-max"
          onClick={() => sendNewMessage("")}
        >
          <i className="ri-send-plane-2-line text-white"></i>
        </button>
      </div>
    </div>
  )
}