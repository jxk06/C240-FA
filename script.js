const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

navToggle?.addEventListener("click", () => {
    mainNav?.classList.toggle("open");
});

const API_BASE_URL = "https://c240-fa-backend.onrender.com";

const allergyList = document.getElementById("allergy-list");
const addAllergyForm = document.getElementById("add-allergy-form");
const newAllergyInput = document.getElementById("new-allergy-input");
const apiFeedback = document.getElementById("api-feedback");
const backendStatus = document.getElementById("backend-status");
const botpressFeedback = document.getElementById("botpress-feedback");
const openBotpressButton = document.getElementById("open-botpress-button");

const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");

tabs.forEach((button) => {
    button.addEventListener("click", () => {
        tabs.forEach((tab) => tab.classList.remove("active"));
        panels.forEach((panel) => panel.classList.remove("active"));

        button.classList.add("active");
        const tabName = button.dataset.tab;
        document.getElementById(`${tabName}-tab`)?.classList.add("active");

        if (tabName === "chatbot") {
            openBotpressChat();
        }
    });
});

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
            "Content-Type":
                options.body instanceof FormData
                    ? undefined
                    : "application/json",
            ...options.headers,
        },
        ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || `Request failed with status ${response.status}`,
        );
    }

    return data;
}

function setFeedback(message, type = "info") {
    apiFeedback.textContent = message;
    apiFeedback.className = `api-feedback ${type}`;
}

function setBotpressFeedback(message, type = "info") {
    if (!botpressFeedback) return;
    botpressFeedback.textContent = message;
    botpressFeedback.className = `api-feedback ${type}`;
}

function getBotpressWidget() {
    return (
        window.botpress ||
        window.botpressWebChat ||
        window.botpressWebchat ||
        window.botpress?.webchat ||
        window.botpress?.webChat ||
        window.botpress?.webChatWidget
    );
}

function openBotpressWithWidget(widget) {
    if (typeof widget === "function") {
        widget();
        return true;
    }

    const actions = [
        "open",
        "openChat",
        "toggle",
        "toggleChat",
        "show",
        "showChat",
        "display",
        "bringToFront",
    ];
    for (const action of actions) {
        if (typeof widget[action] === "function") {
            widget[action]();
            return true;
        }
    }
    return false;
}

function openBotpressChat(retries = 10) {
    const widget = getBotpressWidget();
    if (widget && openBotpressWithWidget(widget)) {
        setBotpressFeedback("Botpress chat opened.", "success");
        return;
    }

    if (retries > 0) {
        setBotpressFeedback("Waiting for Botpress widget to load...", "info");
        window.setTimeout(() => openBotpressChat(retries - 1), 500);
        return;
    }

    setBotpressFeedback(
        "Botpress chat widget is not loaded yet. Please wait a moment or refresh the page.",
        "error",
    );
}

function renderAllergyList(allergies) {
    allergyList.innerHTML = "";

    if (!allergies.length) {
        allergyList.innerHTML =
            '<p class="empty-state">No allergies saved yet.</p>';
        return;
    }

    allergies.forEach((allergy) => {
        const item = document.createElement("div");
        item.className = "allergy-card";
        item.innerHTML = `
      <div>
        <strong>${allergy}</strong>
      </div>
      <button type="button" class="btn btn-secondary remove-allergy" data-allergen="${encodeURIComponent(allergy)}">Remove</button>
    `;
        allergyList.appendChild(item);
    });
}

async function fetchAllergies() {
    try {
        const data = await request("/allergies");
        renderAllergyList(data.allergies || []);
        setFeedback("Allergy profile loaded.", "success");
    } catch (error) {
        allergyList.innerHTML =
            '<p class="empty-state">Unable to load allergies.</p>';
        setFeedback(error.message, "error");
    }
}

async function checkBackendStatus() {
    try {
        await request("/allergies");
        backendStatus.textContent = "Backend is reachable.";
        backendStatus.className = "status-ok";
    } catch (error) {
        backendStatus.textContent =
            "Backend is unavailable. Please check your network or API host.";
        backendStatus.className = "status-error";
    }
}

addAllergyForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const allergen = newAllergyInput.value.trim();

    if (!allergen) {
        setFeedback("Enter an allergy before adding.", "error");
        return;
    }

    try {
        const data = await request("/allergies", {
            method: "POST",
            body: JSON.stringify({ allergen }),
        });
        setFeedback(data.message || "Allergy added.", "success");
        newAllergyInput.value = "";
        fetchAllergies();
    } catch (error) {
        setFeedback(error.message, "error");
    }
});

allergyList?.addEventListener("click", async (event) => {
    const button = event.target.closest(".remove-allergy");
    if (!button) return;

    const allergen = decodeURIComponent(button.dataset.allergen);

    try {
        const data = await request(
            `/allergies/${encodeURIComponent(allergen)}`,
            {
                method: "DELETE",
            },
        );
        setFeedback(data.message || "Allergy removed.", "success");
        fetchAllergies();
    } catch (error) {
        setFeedback(error.message, "error");
    }
});

openBotpressButton?.addEventListener("click", openBotpressChat);

window.addEventListener("DOMContentLoaded", () => {
    fetchAllergies();
    checkBackendStatus();
});
