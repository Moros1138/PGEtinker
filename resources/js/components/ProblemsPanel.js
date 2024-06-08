
export default class ProblemsPanel
{
    state;
    
    constructor(state)
    {
        this.state = state;
        console.log("Problems panel", "constructor");
        
        window.addEventListener("update-problems-panel", (event) =>
        {
            this.getElement().innerHTML = "";
            
            let diagnostics = [];
            diagnostics.push([]);
            diagnostics.push([]);
            diagnostics.push([]);
            diagnostics.push([]);

            event.detail.forEach((diagnostic) =>
            {
                diagnostics[diagnostic.severity].push(diagnostic);
            });

            const wrapper = document.createElement("table");
            
            const header = document.createElement("thead");
            
            header.innerHTML = `
                <td>Severity</td>
                <td>Line</td>
                <td>Column</td>
                <td>Message</td>
            `;

            const body   = document.createElement("tbody");
            
            while(diagnostics.length > 0)
            {
                let currentDiagnostics = diagnostics.shift();
                currentDiagnostics.sort((a, b) =>
                {
                    return (parseInt(a.range.start._line) - parseInt(b.range.start._line));
                });

                currentDiagnostics.forEach((diagnostic) =>
                {
                    const container = document.createElement("tr");
                    container.classList.toggle(["Error", "Warning", "Info", "Hint"][diagnostic.severity].toLowerCase());

                    container.innerHTML = `
                        <th>${["Error", "Warning", "Info", "Hint"][diagnostic.severity]}</th>
                        <th>${diagnostic.range.start._line}</th>
                        <th>${diagnostic.range.start._character}</th>
                        <th>${diagnostic.message}</th>
                    `;
                    
                    container.setAttribute("data-line-number", diagnostic.range.start._line);
                    container.setAttribute("data-column", diagnostic.range.start._character);
    
                    container.addEventListener("click", (event) =>
                    {
                        event.preventDefault();
    
                        const lineNumber = parseInt(container.getAttribute("data-line-number")) + 1;
                        const column     = parseInt(container.getAttribute("data-column")) + 1;
                        this.state.editorPanel.reveal({ lineNumber, column });
                    });

                    body.append(container);
                });
            }
            
            wrapper.append(header);
            wrapper.append(body);
            
            this.getElement().append(wrapper);
            this.state.setActiveTab('problems');
        });
    }

    clear()
    {
        this.getElement().innerHTML = "";
    }

    focus()
    {
        this.state.setActiveTab("problems");
    }

    getElement()
    {
        return document.querySelector("#problems-panel");
    }

    onInit() {}

    register()
    {
        this.state.layout.registerComponent('problemsComponent', function(container)
        {
            container.getElement().html(`
                <div id="problems-panel">
                </div>
            `);
        });        
    }
    
    setContent(content)
    {
        const element = this.getElement();
        
        while(element.lastElementChild)
        {
            element.removeChild(element.lastElementChild);
        }
        
        if(typeof content === "string")
        {
            element.innerHTML = `<div>${content}</div>`; 
        }
        else
        {
            element.append(content);
        }
            
    }
}

