
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
        option.value = options[i];
        option.innerHTML = options[i];
        
        if(options[i] == initialValue)
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
            }
        ));
        
        dialog.querySelector(".content").append(button(
            "Restore Default Layout",
            (event) =>
            {
                state.switchToDefaultLayout();
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
                    
                state.UpdateTheme();
            },
            ["dark", "light"],
            state.theme
        ));

        dialog.querySelector(".content").append(toggle(
            "The Label",
            "The Description",
            (event) =>
            {
                console.log(event.target.checked, "something happened 1");
            }
        ));
    
        dialog.querySelector(".content").append(toggle(
            "Lorem ipsum dolor sit amet",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit amet congue nulla, sed lacinia nisi. Etiam luctus euismod est eget interdum. Suspendisse fermentum lacus mauris, vitae sodales nunc tempor.",
            (event) =>
            {
                console.log(event.target.checked, "something happened 2");
            }
        ));

        dialog.querySelector(".content").append(toggle(
            "The Label",
            "The Description",
            (event) =>
            {
                console.log(event.target.checked, "something happened 3");
            }
        ));

        dialog.querySelector(".content").append(toggle(
            "The Label",
            "The Description",
            (event) =>
            {
                console.log(event.target.checked, "something happened 4");
            }
        ));
        
        dialog.querySelector(".ok").addEventListener("click", (event) =>
        {
            dialog.remove();
            resolve();
        });
        
        document.body.appendChild(dialog);
    });
}
