const setupClients = (clients) => {
    const table = document.getElementById("clientsTable").getElementsByTagName("tbody")[0];

    const addRowCell = (row, cellData, cssClass) => {
        const cell = document.createElement("td");

        cell.innerText = cellData;

        if (cssClass) {
            cell.className = cssClass;
        };

        row.appendChild(cell);
    };

    const addRow = (table, client) => {
        const row = document.createElement("tr");

        addRowCell(row, client.name || "");
        addRowCell(row, client.pId || "");
        addRowCell(row, client.gId || "");
        addRowCell(row, client.accountManager || "");

        row.onclick = () => {
            clientClickedHandler(client);
        };

        table.appendChild(row);
    };

    clients.forEach((client) => {
        addRow(table, client);
    });
};

const toggleFdc3Available = () => {
    const span = document.getElementById("glueSpan");

    span.classList.remove("label-warning");
    span.classList.add("label-success");
    span.textContent = "fdc3 is available";
};

const loadClientsData = async () => {
    const clients = await fetch("http://localhost:8080/api/clients")
        .then((clientsResponse) => clientsResponse.json())
        .catch(() => []);

    setupClients(clients);
}

const clientClickedHandler = async (client) => {
    if (!window.fdc3) {
        return;
    }

    const context = { client, type: 'ClientDetails' };
    await window.fdc3.broadcast(context)
};

const setupIOConnect = async () => {
    const glue = await window.GlueWeb();
    window.glue = glue;
}

const fdc3Ready = () => {
  toggleFdc3Available()
  window.fdc3.joinUserChannel('fdc3.channel.1')
}

// Entry point
const start = async () => {
    loadClientsData();

    await setupIOConnect();

    if (window.fdc3) {
      fdc3Ready();
    } else {
      window.addEventListener('fdc3Ready', fdc3Ready);
    }

    document.getElementById('startClientDetailsBtn').addEventListener('click', () => {
      window.fdc3.open({appId: 'js-client-details'})
    })
};

start().catch(console.error);