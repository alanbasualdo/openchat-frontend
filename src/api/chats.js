import chatApi from "./axios"

export const GetAllChats = async () => {
    try {
        const response = await chatApi.get('/api/chat/get-all-chats')
        return response.data
    } catch (error) {
        throw error
    }
}

export const CreateNewChat = async (members) => {
    try {
        const response = await chatApi.post('/api/chat/create-new-chat', { members })
        return response.data
    } catch (error) {
        throw error
    }
}

export const ClearChatMessages = async (chatId) => {
    try {
        const response = await chatApi.post('/api/chat/clear-unread-messages', {
            chat: chatId
        })
        return response.data
    } catch (error) {
        throw error
    }
}