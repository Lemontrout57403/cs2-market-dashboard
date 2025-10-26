const tableBody = document.querySelector("#marketTable tbody");
const searchInput = document.querySelector("#search");
const sortSelect = document.querySelector("#sortSelect");
const categorySelect = document.querySelector("#categorySelect");
const refreshBtn = document.querySelector("#refreshBtn");

let currentData = [];

async function loadData() {
    tableBody.innerHTML = "<tr><td colspan='7'>Lade Daten...</td></tr>";
    try {
        const res = await fetch("/api/fetchSkins.js");
        const data = await res.json();
        if(!data.success) throw "Fehler";

        currentData = data.items;
        displayData(currentData);
        renderChart(currentData);
    } catch(e) {
        console.error(e);
        tableBody.innerHTML = "<tr><td colspan='7'>Fehler beim Laden</td></tr>";
    }
}

function displayData(items) {
    let filtered = items.filter(i => i.name.toLowerCase().includes(searchInput.value.toLowerCase()));
    const cat = categorySelect.value;
    if(cat !== "all") filtered = filtered.filter(i => i.category===cat);

    const sortBy = sortSelect.value;
    filtered.sort((a,b)=>parseFloat(a[sortBy].replace(",","."))-parseFloat(b[sortBy].replace(",",".")));

    tableBody.innerHTML = "";
    filtered.forEach(i=>{
        const row = document.createElement("tr");
        row.innerHTML=`
            <td><img src="${i.image}" width="60"/></td>
            <td>${i.name}</td>
            <td>${i.rarity}</td>
            <td>${i.price}</td>
            <td>${i.volume}</td>
            <td>${i.median}</td>
            <td><a href="${i.market_url}" target="_blank">Steam</a></td>
        `;
        tableBody.appendChild(row);
    });
}

function renderChart(items){
    const ctx=document.getElementById("priceChart").getContext("2d");
    const labels=items.map(i=>i.name);
    const prices=items.map(i=>parseFloat(i.price.replace(",","."))||0);
    if(window.chartInstance) window.chartInstance.destroy();
    window.chartInstance=new Chart(ctx,{
        type:'bar',
        data:{labels,datasets:[{label:'Preis',data:prices,backgroundColor:'rgba(102,192,244,0.7)'}]},
        options:{responsive:true,plugins:{legend:{display:false}}}
    });
}

searchInput.addEventListener("input",()=>displayData(currentData));
sortSelect.addEventListener("change",()=>displayData(currentData));
categorySelect.addEventListener("change",()=>displayData(currentData));
refreshBtn.addEventListener("click",loadData);

loadData();
setInterval(loadData,5*60*1000);
