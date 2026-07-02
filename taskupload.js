// ============================
// DATA365 TASK UPLOAD
// ============================

const services = document.querySelectorAll(".service");
const duration = document.getElementById("duration");

const serviceName = document.getElementById("serviceName");
const durationText = document.getElementById("durationText");
const totalPrice = document.getElementById("totalPrice");

const telegramBtn = document.getElementById("telegramBtn");

let selectedService = "";
let selectedPrice = 0;

// ============================
// SELECT SERVICE
// ============================

services.forEach(card=>{

card.addEventListener("click",()=>{

services.forEach(c=>c.classList.remove("active"));

card.classList.add("active");

selectedService = card.dataset.name;

selectedPrice = Number(card.dataset.price);

updateSummary();

});

});

// ============================
// DURATION
// ============================

duration.addEventListener("change",updateSummary);

// ============================
// UPDATE SUMMARY
// ============================

function updateSummary(){

const extra = Number(duration.value);

const hours =
duration.options[
duration.selectedIndex
].text.split("(")[0].trim();

const total = selectedPrice + extra;

serviceName.innerText =
selectedService || "None Selected";

durationText.innerText = hours;

totalPrice.innerText =
selectedService
?
`₦${total.toLocaleString()}`
:
"₦0";

}

// ============================
// TELEGRAM BUTTON
// ============================

telegramBtn.addEventListener("click",()=>{

if(!selectedService){

alert("Please select a promotion service.");

return;

}

const extra = Number(duration.value);

const hours =
duration.options[
duration.selectedIndex
].text.split("(")[0].trim();

const total = selectedPrice + extra;

const message =

`👋 Hello Data365 Admin!

I want to promote my social media.

━━━━━━━━━━━━━━

📌 Service:
${selectedService}

⏰ Duration:
${hours}

💰 Total Price:
₦${total.toLocaleString()}

Please tell me how to make payment.

Thank you 💜`;

const url =
`https://t.me/demi_d_lord?text=${encodeURIComponent(message)}`;

window.open(url,"_blank");

});

// ============================
// INITIALIZE
// ============================

updateSummary();