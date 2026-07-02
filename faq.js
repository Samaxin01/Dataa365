// ==============================
// DATA365 FAQ
// ==============================

const faqs =
document.querySelectorAll(".faq");

const searchInput =
document.getElementById("searchInput");

// ==============================
// ACCORDION
// ==============================

faqs.forEach(faq=>{

const question =
faq.querySelector(".question");

question.addEventListener("click",()=>{

// Close others

faqs.forEach(item=>{

if(item!==faq){

item.classList.remove("active");

}

});

// Toggle current

faq.classList.toggle("active");

});

});

// ==============================
// SEARCH
// ==============================

searchInput.addEventListener("keyup",()=>{

const value =
searchInput.value
.toLowerCase()
.trim();

faqs.forEach(faq=>{

const text =
faq.innerText.toLowerCase();

if(text.includes(value)){

faq.style.display="block";

}else{

faq.style.display="none";

}

});

});

// ==============================
// OPEN FIRST FAQ
// ==============================

if(faqs.length>0){

faqs[0].classList.add("active");

}

// ==============================
// SMOOTH PAGE LOAD
// ==============================

window.addEventListener("load",()=>{

document.body.style.opacity="0";

document.body.style.transition="opacity .3s";

setTimeout(()=>{

document.body.style.opacity="1";

},50);

});