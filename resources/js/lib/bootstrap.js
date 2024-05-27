import axios from 'axios';

window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

if(window.location.pathname.indexOf("/staging/") == 0)
{
    window.axios.defaults.baseURL = `${window.location.protocol}//${window.location.host}/staging/`;
}
