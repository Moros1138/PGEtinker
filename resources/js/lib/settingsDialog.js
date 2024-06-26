import { createToast, ToastType } from './createToast';
import { getStorageValue, setStorageValue } from './storage';

let fieldId = 0;

/**
 * 
 * @param {string} label 
 * @param {string} description 
 * @param {(event) => void} valueCallback
 * @param {options[]} options
 * @param {string} initialValue
 * @returns 
 */
function select(label, description, valueCallback, options, initialValue)
{
    fieldId++;
    let select = document.createElement("div")
    
    select.classList.toggle("form-group", true);
    select.classList.toggle("select", true);

    select.innerHTML = `
        <div class="form-label">${label}</div>
        <div class="form-description">${description}</div>
        <select name="select-${fieldId}"></select>
    `;

    for(let i = 0; i < options.length; i++)
    {
        let option = document.createElement("option");
        option.value = options[i].value;
        option.innerHTML = options[i].label;
        
        if(options[i].value == initialValue)
        {
            option.selected = true;
        }

        select.querySelector("select").append(option);
    }
    
    select.addEventListener("change", (event) =>
    {
        valueCallback(event);
    });
   
    return select;
}

/**
 * 
 * @param {string} label 
 * @param {string} description 
 * @param {(event) => void} valueCallback 
 * @param {boolean} initialValue
 * @returns 
 */
function toggle(label, description, valueCallback, initialValue)
{
    fieldId++;
    let toggle = document.createElement("div")
    
    toggle.classList.toggle("form-group", true);
    toggle.classList.toggle("toggle", true);

    toggle.innerHTML = `
        <div class="form-label">${label}</div>
        <label>
            <input type="checkbox" name="toggle-${fieldId}" ${initialValue ? "checked" : ""}>
            ${description}
        </label>
    `;
    
    toggle.addEventListener("change", (event) =>
    {
        event.preventDefault();
        valueCallback(event);
    });

    return toggle;
}

/**
 * 
 * @param {string} label 
 * @param {(event) => void} callback 
 * @returns 
 */
function button(label, callback)
{
    fieldId++;
    let button = document.createElement("button");
    button.setAttribute("name", `button-${fieldId}`);

    button.innerHTML = label;
    
    button.addEventListener("click", (event) =>
    {
        callback(event);
    });

    return button;
}

export default function settingsDialog(state)
{
    
    return new Promise((resolve) =>
    {
        let dialog = document.createElement('div');
                
        dialog.classList.toggle("dialog", "true");
        dialog.classList.toggle("settings-dialog", "true");
        
        dialog.innerHTML = `
            <div class="window">
                <div class="header">Settings</div>
                <div class="content">
                </div>
                <div class="footer">
                    <button type="button" class="ok">Close</button>
                </div>                
            </div>`;
        
        
        dialog.querySelector(".content").append(button(
            "Load Default Code",
            (event) =>
            {
                state.defaultCode();
                createToast("Loaded default code.", ToastType.Info);
            }
        ));
        
        dialog.querySelector(".content").append(button(
            "Restore Default Layout",
            async(event) =>
            {
                await state.switchToDefaultLayout();
                createToast("Restored default layout.", ToastType.Info);
            }
        ));

        dialog.querySelector(".content").append(select(
            "Theme",
            "Choose from the available themes!",
            (event) =>
            {
                if(event.target.value === "dark")
                    state.theme = "dark";

                if(event.target.value === "light")
                    state.theme = "light";
                    
                createToast(`Changing theme: ${state.theme}`, ToastType.Info);
                setStorageValue("theme", state.theme);

                state.UpdateTheme();
            },
            [
                {
                    label: "Dark Theme",
                    value: "dark",
                },
                {
                    label: "Light Theme",
                    value: "light",
                }
            ],
            getStorageValue("theme")
        ));


        dialog.querySelector(".content").append(toggle(
            "Editor> Inlay Hints: Enabled",
            "Enables the inlay hints in the editor.",
            (event) =>
            {
                setStorageValue("editor.inlayHints.enabled", event.target.checked);
                state.editorPanel.updateConfiguration();
            },
            getStorageValue("editor.inlayHints.enabled")
        ));


        dialog.querySelector(".content").append(toggle(
            "Diagnostics> Javid Mode: Enabled",
            "Enabling Javid Mode prevents Clang Tidy warnings from appearing in the editor and the problems panel.",
            (event) =>
            {
                setStorageValue("diagnostics.javidMode", event.target.checked);
                if(event.target.checked)
                {
                    window.dispatchEvent(new CustomEvent("update-problems-panel", { detail: [] }));
                }
            },
            getStorageValue("diagnostics.javidMode")
        ));
    

        // dialog.querySelector(".content").append(toggle(
        //     "The Label",
        //     "The Description",
        //     (event) =>
        //     {
        //         console.log(event.target.checked, "something happened 3");
        //     }
        // ));

        // dialog.querySelector(".content").append(toggle(
        //     "The Label",
        //     "The Description",
        //     (event) =>
        //     {
        //         console.log(event.target.checked, "something happened 4");
        //     }
        // ));
        
        dialog.querySelector(".ok").addEventListener("click", (event) =>
        {
            dialog.remove();
            resolve();
        });
        
        document.body.appendChild(dialog);
    });
}
