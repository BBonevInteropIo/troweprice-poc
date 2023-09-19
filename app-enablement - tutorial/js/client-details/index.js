const setFields = (client) => {
    const elementName = document.querySelectorAll("[data-name]")[0];
    elementName.innerText = client.name;

    const elementAddress = document.querySelectorAll("[data-address]")[0];
    elementAddress.innerText = client.address;

    const elementPhone = document.querySelectorAll("[data-phone]")[0];
    elementPhone.innerText = client.contactNumbers;

    const elementOccupation = document.querySelectorAll("[data-email]")[0];
    elementOccupation.innerText = client.email;

    const elementManager = document.querySelectorAll("[data-manager]")[0];
    elementManager.innerText = client.accountManager;
};

const toggleFdc3Available = () => {
    const span = document.getElementById("glueSpan");

    span.classList.remove("label-warning");
    span.classList.add("label-success");
    span.textContent = "fdc3 is available";
};

const subscribeSelectedClient = () => {
    window.fdc3.addContextListener('ClientDetails', (context) => {
        if (context && context.client) {
            setFields(context.client);
        }
    })
}

const setupGlue = async () => {
    const glue = await window.GlueWeb();
    window.glue = glue;
}

const fdc3Ready = () => {
  toggleFdc3Available();
  window.fdc3.joinUserChannel('fdc3.channel.1');
}

const start = async () => {
    await setupGlue();

    if (window.fdc3) {
      fdc3Ready();
    } else {
      window.addEventListener('fdc3Ready', fdc3Ready);
    }

    subscribeSelectedClient();
};

start().catch(console.error);