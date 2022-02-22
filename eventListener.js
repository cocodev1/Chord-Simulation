import { useState, useEffect } from "react"

function useEventListener() {

    const [events, setEvents] = useState([])

    function addEvent(event) {
        console.log('EDFF')
        setEvents(events => [event, ...events])
    }

    return [events, addEvent]
}

export default useEventListener