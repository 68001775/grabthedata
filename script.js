let boothData;
function fetchData() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/1_xwKmN2ZOWVadU5_eC-MJQSG866pDNVbgWGyBAkWWZw/export?format=csv'; // Google Sheets CSV link
    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            //console.log('Fetched data:', data); // Log fetched data
            boothData = data;
            processCSV(boothData);
        })
        .catch(error => console.error('Error fetching data:', error));
}


function processCSV(data) {
    if (!data) {
        console.error('No data received or data is undefined');
        return; // Exit if data is empty or undefined
    }

    const lines = data.trim().split('\n').slice(1); // Skip header
    const boothDemerits = Array(23).fill().map(() => ({ am: 0, pm: 0 }));

    //console.log('Lines:', lines); // Log the lines split from the data

    lines.forEach(line => {
        //console.log(line)
        //console.log(Papa.parse(line).data)
        const cells = Papa.parse(line).data[0];//.split(',');
        //console.log(cells);
        if (cells.length < 6) {
            console.warn('Skipping line due to insufficient columns:', line); // Log warning for skipped lines
            return; // Skip rows without sufficient columns
        }
        //console.log(cells);
        const dateTimeStr = cells[0].trim();
        const timePart = dateTimeStr.split(' ')[1];
        const hour = parseInt(timePart.split(':')[0], 10);
        const isAM = hour < 12;
        let date = Date.parse(dateTimeStr.split(' ')[0])
        
    let endDate = new Date();
    let startDate = new Date(endDate);

    startDate.setDate(endDate.getDate() - 5);
    if (document.getElementById("startdate").value !== "") {
        startDate = new Date(document.getElementById("startdate").value);
        //startDate.setDate(startDate.getDate() + 1)
    }
    if (document.getElementById("enddate").value !== "") {
        endDate = new Date(document.getElementById("enddate").value);
        endDate.setDate(endDate.getDate() + 1) //dealing with GMT
    }
    console.log(startDate, endDate)

    //startDate = startDate.getTime();
    ///endDate = endDate.getTime();



    if (date > startDate && date < endDate) {
        console.log(date > startDate, date < endDate);
            for (let i = 1; i < cells.length; i++) {
                const boothIndex = i - 1;
                if (boothIndex >= 0 && boothIndex < 23) {
                    const demerit = cells[i].trim();
                    if (demerit !== 'Good') {
                        count = demerit.split(",").length;
                        console.log("adding demerit.  hour:", hour, "isAM:", isAM, "demerit", demerit, "booth: ", boothIndex);

                        if (isAM) {
                            boothDemerits[boothIndex].am += count;
                        //debugger;
                       // console.log(boothDemerits)
                        } else {
                        boothDemerits[boothIndex].pm += count;
                        }
                    }
                }
            }
        }
    });

    //console.log('Booth Demerits:', boothDemerits);
    renderTable(boothDemerits);
}



function renderTable(boothDemerits) {
    const tableBody = document.querySelector('#demeritsTable tbody');
    tableBody.innerHTML = ''; // Clear previous data

    boothDemerits.forEach((booth, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>Booth ${index + 1}</td>
            <td>${booth.am}</td>
            <td>${booth.pm}</td>
        `;
        tableBody.appendChild(row);
    });
}

fetchData();


document.getElementById("startdate").addEventListener("change", function(){
    processCSV(boothData);
})

document.getElementById("enddate").addEventListener("change", function(){
    processCSV(boothData);
})