const dgram = require("node:dgram")
const dnsPacket = require("dns-packet")

const server = dgram.createSocket('udp4')

const db = {
    'thecv.in': {
        type: "A",
        data: "76.76.21.23"
    },
    'prakhar.thecv.in': {
        type: "CNAME",
        data: "cname.vercel-dns.com"
    }
}

server.on('message', (msg, rinfo) => {
    const incommingReq = dnsPacket.decode(msg)
    const ipFromDb = db[incommingReq.questions[0].name]

    const ans = dnsPacket.encode({
        type: 'response',
        id: incommingReq.id,
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: incommingReq.questions,
        answers: [{
            type: ipFromDb.type,
            class: "IN",
            name: incommingReq.questions[0].name,
            data: ipFromDb.data
        }]
    })

    server.send(ans, rinfo.port, rinfo.address)
})


server.bind(3000, () => console.log("DNS server is running on port 3000"))


// For creating your own DNS server you just need to add a NS record in your registered domain to some IP (where this project is deployed!).
// Now all your request will be handled here