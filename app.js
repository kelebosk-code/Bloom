"use strict";
const STORAGE={feeling:"bloom_feeling",care:"bloom_care",journals:"bloom_journals",delights:"bloom_delights",evening:"bloom_evening"};
const STEPS=["Drink a glass of water.","Take three slow breaths.","Step outside for five minutes.","Stretch gently for two minutes.","Spend a quiet moment in prayer or reflection.","Send a kind message.","Notice one beautiful thing today."];

document.addEventListener("DOMContentLoaded",()=>{
  setupNavigation();
  setupChoiceGroup("feeling",STORAGE.feeling);
  setupChoiceGroup("care",STORAGE.care);
  setupGentleStep();
  setupJournal();
  setupDelights();
  setupSettings();
  updateGarden();
  registerServiceWorker();
});

function setupNavigation(){
  const pages=[...document.querySelectorAll(".page")];
  const buttons=[...document.querySelectorAll(".nav-button")];
  buttons.forEach(button=>button.addEventListener("click",()=>{
    const target=button.dataset.target;
    pages.forEach(page=>page.classList.toggle("active",page.dataset.page===target));
    buttons.forEach(item=>item.classList.remove("active"));
    button.classList.add("active");
    if(target==="garden")updateGarden();
    window.scrollTo({top:0,behavior:"smooth"});
  }));
}

function setupChoiceGroup(groupName,storageKey){
  const container=document.querySelector(`[data-choice-group="${groupName}"]`);
  if(!container)return;
  const buttons=[...container.querySelectorAll("button")];
  const saved=localStorage.getItem(storageKey);
  buttons.forEach(button=>{
    button.classList.toggle("selected",button.textContent.trim()===saved);
    button.addEventListener("click",()=>{
      buttons.forEach(item=>item.classList.remove("selected"));
      button.classList.add("selected");
      localStorage.setItem(storageKey,button.textContent.trim());
      updateGarden();
    });
  });
}

function setupGentleStep(){
  const element=document.getElementById("gentle-step");
  if(!element)return;
  const dayNumber=Math.floor(Date.now()/86400000);
  element.textContent=STEPS[dayNumber%STEPS.length];
}

function setupJournal(){
  const box=document.getElementById("journal-entry");
  const button=document.getElementById("save-journal");
  const status=document.getElementById("journal-status");
  if(!box||!button||!status)return;
  button.addEventListener("click",()=>{
    const text=box.value.trim();
    if(!text){status.textContent="Write something before saving.";return;}
    const entries=readArray(STORAGE.journals);
    entries.unshift({text,createdAt:new Date().toISOString()});
    localStorage.setItem(STORAGE.journals,JSON.stringify(entries));
    box.value="";
    status.textContent="Reflection saved.";
    setTimeout(()=>status.textContent="",2500);
    updateGarden();
  });
}

function setupDelights(){
  const box=document.getElementById("delight-entry");
  const button=document.getElementById("save-delight");
  if(!box||!button)return;
  renderDelights();
  button.addEventListener("click",()=>{
    const text=box.value.trim();
    if(!text)return;
    const delights=readArray(STORAGE.delights);
    delights.unshift({text,createdAt:new Date().toISOString()});
    localStorage.setItem(STORAGE.delights,JSON.stringify(delights));
    box.value="";
    renderDelights();
    updateGarden();
  });
}

function renderDelights(){
  const list=document.getElementById("delight-list");
  if(!list)return;
  const delights=readArray(STORAGE.delights);
  list.innerHTML="";
  delights.slice(0,20).forEach(delight=>{
    const item=document.createElement("div");
    item.className="saved-item";
    const text=document.createElement("div");
    text.textContent=delight.text;
    const date=document.createElement("small");
    date.textContent=new Date(delight.createdAt).toLocaleDateString();
    item.append(text,date);
    list.appendChild(item);
  });
}

function setupSettings(){
  const toggle=document.getElementById("evening-toggle");
  if(!toggle)return;
  const enabled=localStorage.getItem(STORAGE.evening)==="true";
  toggle.checked=enabled;
  document.body.classList.toggle("evening",enabled);
  toggle.addEventListener("change",()=>{
    document.body.classList.toggle("evening",toggle.checked);
    localStorage.setItem(STORAGE.evening,String(toggle.checked));
  });
}

function updateGarden(){
  const message=document.getElementById("garden-message");
  if(!message)return;
  const total=readArray(STORAGE.journals).length+readArray(STORAGE.delights).length+(localStorage.getItem(STORAGE.feeling)?1:0)+(localStorage.getItem(STORAGE.care)?1:0);
  if(total===0)message.textContent="Every garden begins with a moment of care.";
  else if(total<4)message.textContent="Your first signs of growth are appearing.";
  else if(total<10)message.textContent="Your garden is growing gently.";
  else message.textContent="Your garden is beginning to bloom.";
}

function readArray(key){
  try{const value=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(value)?value:[];}
  catch{return [];}
}

function registerServiceWorker(){
  if(!("serviceWorker" in navigator))return;
  window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
}