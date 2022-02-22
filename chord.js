import crypto from 'crypto'


const M = 128
const maxId = BigInt(2**M)

function isBetween(lower, upper, id) {
    if(lower < upper) {
        if(id > lower && id < upper) {
            return true
        }else {
            return false
        }
    } else {
        return (id >= lower && id >= upper) || (id <= lower && id <= upper)
    }
}

function mod(n, m) {
    m = BigInt(m)
    n = BigInt(n)
    return ((n % m) + m) % m
}

class Node {

    constructor(url, addEvent, setData) {
        this.addEvent = addEvent
        this.setData = setData
        this.values = {}
        this.finger = []

        var hash = crypto.createHash('sha1').update(url).digest("hex")
        if (hash.length % 2) { hash = '0' + hash; };
        this.id = BigInt('0x' + hash);
        this.predecessor
        this.successor

        for(var i = 1; i <= M; i++) {
            this.finger[i-1] = {start: (this.id + BigInt((2**i))) % maxId}
        }
    }

    findSuccessor(id) {
        var node = this.findPredecessor(id)
        this.addEvent((e) => [{event: "findSuccessor", value: id, node: node.successor}, ...e])
        return node.successor
    }

    findPredecessor(id) {
        var node = this
        var nodeId = node.id
        var successor = this.successor
        while(isBetween(nodeId, successor.id, id) != true) {
            if(nodeId == this.id) {
                node = this.closestPrecedingFinger(id)
                if(node.id == this.id) {
                    continue
                }
            } else {
                node = node.closestPrecedingFinger(id)

            }
            nodeId = node.id
            successor = node.successor
        }
        return node
    }

    closestPrecedingFinger(id) {
        for(var i = M-1; i != 0; i--) {
            var node = this.finger[i].node
            if(isBetween(this.id, id, node.id)) {
                return node
            }
        }
        return this
    }

    join(node) {
        this.addEvent((e) => [{event: "join", value: this.id, node: this.id}, ...e])
        if(node) {
            this.successor = node.findSuccessor(this.id)
        } else {
            for(var i = M-1; i >= 0; i--) {
                this.finger[i] = {...this.finger[i], node: this}
            }
        }

        this.initFingerTable(node)
        this.updateOthers()
    }

    initFingerTable() {
        if(this.successor) {
            var node = this.successor.findSuccessor(this.finger[0].start)
            this.successor = node
            this.finger[0] = {...this.finger[0], node: node}
            this.predecessor = node.predecessor

            node.updatePredecessor(this)
            for(var i = 0; i < M-1; i++) {

                const start = this.finger[i+1].start

                if(isBetween(this.id, this.finger[i].node.id, start)) {
                    this.finger[i + 1] = {...this.finger[i+1], node: this.finger[i].node}
                } else {
                    this.finger[i + 1].node = node.findSuccessor(this.finger[i + 1].start)
                }
            }
        } else {
            for(var i = 0; i < M; i++) {
                this.finger[i] = {...this.finger[i], node: this}
            }
            this.successor = this
            this.predecessor = this
        }
    }

    updateOthers() {
        for(var i = 1; i < M; i++) {

            var id  = mod(BigInt(this.id - (BigInt(2**(i - 1)))), maxId)
            var p = this.findPredecessor(id)
            if(p.id != this.id) {
                p.updateFingerTable(this, i)
            }
        }
    }

    updatePredecessor(node) {
        this.predecessor = node
    }

    updateFingerTable(s, i) {
        if(this.finger[i] != s) {
            if(s.id == this.id) {
                this.finger[i].node = s
                if(i == 0) {
                    this.successor = s
                }
            } else if(isBetween(this.id, this.finger[i].node.id, s.id)) {
                console.log(this.id, this.finger[i].node.id, s.id)
                this.finger[i].node = s
                if(i == 0) {
                    this.successor = s
                }
                //this.predecessor.updateFingerTable(s, i)
            }
        }
    }

    addKey(key, value) {
        this.addEvent((e) => [{event: "addKey", value: value, key: key, node: this.id}, ...e])
        var hash = crypto.createHash('sha1').update(key).digest("hex")
        if (hash.length % 2) { hex = '0' + hex; }
        var hashedKey = BigInt('0x' + hash) 
        var node = this.findSuccessor(hashedKey)
        if(node.id == this.id) {
            this.values[hashedKey] = value
            this.setData(data => [{dataKey: hashedKey, value: value, node: this.id}, ...data])
        } else {
            node.addKey(key, value)
        }
    }

    getKey(key) {
        key = BigInt(key)
        var node = this.findSuccessor(key)
        if(node.id == this.id) {
            return this.values[key]
        } else {
            return node.getKey(key)
        }
    }
}

export default Node

// https://pdos.csail.mit.edu/papers/chord:sigcomm01/chord_sigcomm.pdf