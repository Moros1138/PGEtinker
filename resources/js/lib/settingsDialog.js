import { createToast, ToastType } from './createToast';
import { getStorageValue, setStorageValue } from './storage';

import exampleCode1 from '../../example1.cpp?raw';
import exampleCode2 from '../../example2.cpp?raw';
import exampleCode3 from '../../example3.cpp?raw';
import exampleCode4 from '../../example4.cpp?raw';
import exampleCode5 from '../../example5.cpp?raw';
import exampleCode6 from '../../example6.cpp?raw';

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
 * @param {string} description
 * @param {(event) => void} callback 
 * @returns 
 */
function button(label, description, callback)
{
    fieldId++;
    
    let group = document.createElement("div");
    group.classList.toggle("form-group", true);

    group.innerHTML = `
        <div class="form-label">${label}</div>
        <div class="form-description">${description}</div>
    `;

    let button = document.createElement("button");
    button.setAttribute("name", `button-${fieldId}`);

    button.innerHTML = label;
    
    button.addEventListener("click", (event) =>
    {
        callback(event);
    });

    group.append(button);

    return group;
}

export default function settingsDialog(state)
{
    
    return new Promise((resolve) =>
    {
        fieldId = 0;
        
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
        
        
        dialog.querySelector(".content").append(select(
            "Load Example Code",
            "Choose from the available examples!",
            (event) =>
            {
                event.preventDefault();
                if(event.target.value !== "")
                {
                    let code = null;

                    if(event.target.value === "example1")
                        code = exampleCode1;

                    if(event.target.value === "example2")
                        code = exampleCode2;

                    if(event.target.value === "example3")
                        code = exampleCode3;

                    if(event.target.value === "example4")
                        code = exampleCode4;

                    if(event.target.value === "example5")
                        code = exampleCode5;

                    if(event.target.value === "example6")
                        code = exampleCode6;

                    if(code)
                    {
                        state.editorPanel.setValue(code);
                        state.editorPanel.reveal({ column: 1, lineNumber: 1 });
                        createToast(`Set Code to ${event.target.selectedOptions[0].innerHTML}`, ToastType.Info);
                    }
                }
            },
            [
                {
                    label: "--Choose Example--",
                    value: "",
                },
                {
                    label: "Example 1",
                    value: "example1",
                },
                {
                    label: "Example 2",
                    value: "example2",
                },
                {
                    label: "Example 3",
                    value: "example3",
                },
                {
                    label: "Example 4",
                    value: "example4",
                },
                {
                    label: "Example 5",
                    value: "example5",
                },
                {
                    label: "Example 6",
                    value: "example6",
                },
            ],
        ));
    
        dialog.querySelector(".content").append(button(
            "Restore Default Layout",
            "If you're unhappy with the layout and want to just start over!",
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
