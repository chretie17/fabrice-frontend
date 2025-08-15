class BackendPort {
    static BASE_URL = 'http://localhost:3000'; // Replace with your backend URL

    static getApiUrl(endpoint) {
        return `${this.BASE_URL}/api/${endpoint}`;
    }
}


export default BackendPort;
