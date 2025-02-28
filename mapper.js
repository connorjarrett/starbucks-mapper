const mapToken = "x3MScBk8lEQyHPtLC6b0CAlmUFrwqIdllSsaRLScT4Y0oem9o7l0jxQkfDagj0Nx"
var map = L.map('map').setView([51.505, -0.09], 13);

var Jawg_Lagoon = L.tileLayer(`https://tile.jawg.io/e391f991-0d0b-4a6b-babd-280bc6e390f7/{z}/{x}/{y}{r}.png?access-token=${mapToken}`, {
    attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 22,
    accessToken: mapToken
}).addTo(map);

fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        var byMonth = {}
        var stores = {}

        data.forEach(transaction => {
            var date = new Date(transaction.date)
            var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()]
            var uniqueMonth = `${month} ${String(date.getFullYear()).slice(-2)}`

            if (!byMonth[uniqueMonth]) {
                byMonth[uniqueMonth] = [transaction]
            } else {
                byMonth[uniqueMonth].push(transaction)
            }

            if (transaction.store) {
                if (!stores[transaction.store]) {
                    stores[transaction.store] = 1
                } else {
                    stores[transaction.store] += 1
                }
            } else {
                stores["Unknown"] += 1
            }
        })


        new Chart(document.querySelector("canvas#monthly"), {
            type: 'bar',
            data: {
                labels: Object.keys(byMonth),
                datasets: [{
                    label: 'Purchases',
                    data: Object.values(byMonth).map(e => { return e.filter(y => { return y.cost > 0 }).length }),
                    backgroundColor: "#006241"
                },
                {
                    label: 'Free Drinks',
                    data: Object.values(byMonth).map(e => { return e.filter(y => { return y.cost == 0 }).length }),
                    backgroundColor: "#d4e9e2"
                }]
            },
            options: {
                responsive: true,
                // maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: true
                    },
                    x: {
                        stacked: true
                    }
                }
            }
        });

        new Chart(document.querySelector("canvas#stores"), {
            type: 'pie',
            data: {
                labels: Object.keys(stores),
                datasets: [{
                    label: 'Stores',
                    data: Object.values(stores),
                    backgroundColor: ["#eed350", "#d3705a", "#4c9f87", "#c89543", "#c0d48b", "#edc4c9"]
                }]
            },
            options: {
                // responsive: true,
            }
        });

        new Chart(document.querySelector("canvas#cost"), {
            type: 'bar',
            data: {
                labels: Object.keys(byMonth),
                datasets: [{
                    label: 'Money Spent',
                    data: Object.values(byMonth).map(e => { return e.reduce((n, { cost }) => n + cost, 0) }),
                    backgroundColor: "#00754a"
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false
            }
        });

        console.log(stores)

        var i = 0
        Object.keys(stores).forEach(s => {
            var f = data.find(e => { return e.store == s })
            var visits = Object.values(stores)[i]
            var size = 30 + 2*visits

            if (f.coords) {
                var icon = new L.Icon({
                    iconUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                    popupAnchor: [1, -34],
                    shadowSize: [size, size]
                });

                var marker = L.marker(Object.values(f.coords), { icon }).addTo(map);
                marker.bindPopup(`<b>${f.store}<b><br>${visits} visits`);
            }

            i++
        })

        console.log(byMonth)
    })