import chatApi from "./axios"

export const SendMessage = async (message) => {
    try {
        const response = await chatApi.post('/api/messages/new-message', message)
        return response.data
    } catch (error) {
        throw error
    }
}

export const GetMessages = async (chatId) => {
    try {
        const response = await chatApi.get(`/api/messages/get-all-messages/${chatId}`)
        return response.data
    } catch (error) {
        throw error
    }
}