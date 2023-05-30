import axios from 'axios'
import { getEnvVariables } from '../helpers/getEnv'

const { VITE_API_URL } = getEnvVariables()

const chatApi = axios.create({
    baseURL: VITE_API_URL
})

chatApi.interceptors.request.use(config => {

    config.headers = {
        ...config.headers,
        'token': localStorage.getItem('token')
    }

    return config
})

export default chatApi