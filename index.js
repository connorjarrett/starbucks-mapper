require('dotenv').config()

const axios = require("axios")
const fs = require("fs")

const baseURL = 'https://www.starbucks.co.uk'


const bearer = process.env.STARBUCKS_BEARER
const googleKey = process.env.GOOGLE_KEY // Optional - for location data

function getTransactionHistory(bearer) {
    var all = []

    if (!bearer) {
        console.error("\nProvide a Starbucks bearer token!")
        console.error("Read the docs at https://github.com/connorjarrett/starbucks-mapper\n")
        return false
    }

    return new Promise((resolve, reject) => {
        function getPage(offset) {
            axios.get(`${baseURL}/api/v2/transactions/`, {
                params: {
                    limit: 50,
                    offset
                },
                headers: {
                    'Api-Authorization': `Bearer ${bearer}`,
                }
            })
                .then(r => {
                    var transactions = r.data.data
                    all = [all, transactions].flat()

                    var next = r.data.links.next

                    if (next) {
                        var offsetNext = new URL(`${baseURL}${next}`).searchParams.get('offset')
                        getPage(offsetNext)
                    } else {
                        resolve(all)
                    }
                })
        }

        getPage(0)
    })
}

getTransactionHistory(bearer)
    .then(transactions => {
        var filtered = []

        transactions.forEach(t => {
            if (t.attributes.transactionType == "Point") {
                var svc = transactions.find(e => {
                    return e != t && Math.abs(new Date(e.attributes.isoDate).valueOf() - new Date(t.attributes.isoDate).valueOf()) < 10000
                })

                var obj = {
                    pointsEarned: t.attributes.points[0].pointsEarned,
                    date: t.attributes.isoDate,
                }

                if (svc) {
                    svc = svc.attributes.svcTransaction
                    obj.cost = svc.amount,
                        obj.store = svc.storeName

                    filtered.push(obj)
                } /* else {
                    // -> The only time this should occur is bonus points won through lotteries etc
                    console.log(t.attributes.isoDate)
                    obj.cost = Math.round((obj.pointsEarned / 3) * 100) / 100
                } */
            } else if (t.attributes.transactionType == "SvcTransaction") {
                if (t.attributes.svcTransaction.amount == 0) {
                    filtered.push({
                        cost: 0,
                        date: t.attributes.isoDate,
                        store: t.attributes.svcTransaction.storeName
                    })
                }
            }
        })

        filtered = filtered.sort((a, b) => {
            return new Date(b.date).valueOf() - new Date(a.date).valueOf()
        })

        const stores = [...new Set(filtered.map(e => {return e.store}))]

        var x = 0

        if (googleKey) {
            stores.forEach(storeName => {
                axios.get("https://www.googleapis.com/customsearch/v1", {
                    params: {
                        key: googleKey,
                        cx: "e0f4f21e24afc4d84",
                        q: storeName.replace(/ *\[[^\]]*]/, '')
                    }
                })
                .then(r => {
                    x++
                    if (r.data.items) {
                        var id = r.data.items[0].link.split("/").splice(-1)
    
                        axios.get(`https://www.starbucks.co.uk/api/v2/stores/${id}/`)
                        .then(s => {
                            var coords = s.data.data.attributes.coordinates    
                            var y = 0
    
                            filtered.forEach(e => {
                                y++ 
                                if (e.store == storeName) {
                                    e.coords = coords
                                }
    
                                // console.log(`x=${x}, y=${y}`)
    
                                if (x == stores.length && y == filtered.length) {
                                    fs.writeFileSync("data.json", JSON.stringify(filtered, null, 4))
                                    console.log("Done")
                                }
                            })
                        })
                    } else {
                        console.log(`match failed for ${storeName}`)
                    }
                })
            })
        } else {
            console.warn("\nSkipped location data - provide Google API key.")
            console.warn("Read the docs at https://github.com/connorjarrett/starbucks-mapper\n")

            fs.writeFileSync("data.json", JSON.stringify(filtered, null, 4))

            console.log("Done")
        }
    })