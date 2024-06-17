// @ts-ignore
import Toastify from "toastify-js";


export const ToastType = {
    Danger: "danger",
    Info: "info",
    Warn: "warning",
    Success: "success",
};

export function createToast(message: string, type: string, duration? : number)
{
    duration = (duration) ? duration : 3000;
    
    if(message == null)
        throw Error("message not set");
    
    if(type == null)
        throw Error("type not set");

    let gravity = "top";
    
    if(document.body.clientWidth <= 750)
        gravity = "bottom";

    Toastify({
        text: message,
        className: type,
        position: "center",
        gravity,
        duration
    }).showToast();
}

