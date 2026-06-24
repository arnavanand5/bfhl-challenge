async function submitData() {

    const responseDiv =
        document.getElementById("response");

    const loader =
        document.getElementById("loader");

    const errorBox =
        document.getElementById("errorBox");

    responseDiv.innerHTML = "";
    errorBox.innerHTML = "";

    const raw =
        document
        .getElementById("inputData")
        .value;

    const arr = raw
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);

    try {

        loader.classList.remove("hidden");

        const response = await fetch(
            "https://bfhl-challenge-swart-nine.vercel.app/bfhl",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    data:arr
                })
            }
        );

        const result =
            await response.json();

        loader.classList.add("hidden");

        renderResponse(result);

    }
    catch(err){

        loader.classList.add("hidden");

        errorBox.innerHTML=
        `
        <div class="error">
            Failed to connect to API
        </div>
        `;
    }
}

function renderResponse(data){

    const responseDiv =
        document.getElementById("response");

    let html = `

    <div class="response-card">

        <div class="section-title">
            Summary
        </div>

        <div class="summary-grid">

            <div class="summary-box">
                <h2>${data.summary.total_trees}</h2>
                <p>Total Trees</p>
            </div>

            <div class="summary-box">
                <h2>${data.summary.total_cycles}</h2>
                <p>Total Cycles</p>
            </div>

            <div class="summary-box">
                <h2>${data.summary.largest_tree_root}</h2>
                <p>Largest Tree Root</p>
            </div>

        </div>

    </div>
    `;

    data.hierarchies.forEach(h=>{

        html += `
        <div class="response-card">

            <div class="section-title">
                Root : ${h.root}
            </div>

            <p>
                Depth :
                ${h.depth || "N/A"}
            </p>

            <p>
                Cycle :
                ${h.has_cycle ? "YES" : "NO"}
            </p>

            <pre>
${JSON.stringify(h.tree,null,2)}
            </pre>

        </div>
        `;
    });

    html += `
    <div class="response-card">

        <div class="section-title">
            Invalid Entries
        </div>

        <pre>
${JSON.stringify(data.invalid_entries,null,2)}
        </pre>

        <div class="section-title">
            Duplicate Edges
        </div>

        <pre>
${JSON.stringify(data.duplicate_edges,null,2)}
        </pre>

    </div>
    `;

    responseDiv.innerHTML = html;
}