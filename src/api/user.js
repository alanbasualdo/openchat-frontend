import chatApi from "./axios"

export const LoginUser = async (user) => {
    try {
        const response = await chatApi.post('/api/user/login', user)
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const RegisterUser = async (user) => {
    try {
        const response = await chatApi.post('/api/user/register', user)
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const GetCurrentUser = async (user) => {
    try {
        const response = await chatApi.get('/api/user/get-current-user', user)
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const GetAllUsers = async (user) => {
    try {
        const response = await chatApi.get('/api/user/get-all-users')
        return response.data
    } catch (error) {
        return error.response.data
    }
}

export const UpdateProfilePicture = async (image) => {
    try {
        const response = await chatApi.post("/api/users/update-profile-picture", {
            image,
        })
        return response.data
    } catch (error) {
        return error.response.data
    }
}