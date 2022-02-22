import styles from "../styles/Home.module.css"
import Node from "../chord"
import * as d3 from "d3"
import {scaleLinear} from "d3-scale"
import { useEffect, useRef, useState } from "react"
import useEventListener from "../eventListener"
import Event from "../components/event"

export default function Home() {

  const keyRef = useRef()
  const valueRef = useRef()

  const [events, addEvent] = useState([])
  const [data, setData] = useState([])
  const ref = useRef()  


  const boostrapNode = useRef()

  useEffect(() => {
    if(addEvent) {
      boostrapNode.current = new Node("boostrap", addEvent, setData)
      boostrapNode.current.join()
      const nodes = [boostrapNode.current]
      for(var i = 0; i < 10; i++) {
        nodes.push(new Node(`re${i.toString()}`,  addEvent, setData))
        nodes[i].join(boostrapNode.current)
        console.log(nodes[i].id, i)
      }
      const arc = scaleLinear().domain([0, Math.max(...nodes.map(node => parseInt(node.id)))]).range([0, 2*Math.PI])
      const svgElement = d3.select(ref.current)
      console.log(svgElement, "3EFR", svgElement.style("height"))
      const svgWidth = parseInt(svgElement.style("width"))
      console.log(svgWidth)
      const svgHeight = parseInt(svgElement.style("height"))
      const cirlceMaxWidth = (svgWidth/2)-80

      svgElement
        .append("circle")
        .attr("cx", () => svgWidth/2)
        .attr("cy", () => svgHeight/2)
        .attr("r", () => cirlceMaxWidth)
        .attr("fill", () => "none")
        .attr("stroke", () => "#18DCFF")
        .attr("stroke-width", () => 2)

      svgElement
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => (Math.cos(arc(parseInt(d.id)))*cirlceMaxWidth)+svgWidth/2)
        .attr("cy", (d, i) => (Math.sin(arc(parseInt(d.id)))*cirlceMaxWidth)+svgHeight/2)
        .attr("r", () => 16)
        .attr("fill", () => "#3D3D3D")
        .attr("stroke", () => "#18DCFF")
        .attr("stroke-width", () => 2)
      
      svgElement
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("x", (d, i) => (Math.cos(arc(parseInt(d.id)))*cirlceMaxWidth)+svgWidth/2)
        .attr("y", (d, i) => (Math.sin(arc(parseInt(d.id)))*cirlceMaxWidth)+svgHeight/2)
        .attr("fill", d => "#FFF")
        .text(d => d.id)
      
    }
  }, [])


  return (
    <div className={styles.container}>
      <div id="left" className={styles.side}>
        <div className={styles.sideHead}>Data</div>
        {data.map((d, i) => <Event key={i} {...d} />)}
      </div>
      <div id="center" className={styles.center}>
        <svg ref={ref} width={"100%"} height={"100%"} />
        <div className={styles.add}>
          <input type="text" placeholder="value" ref={valueRef} />
          <input type="text" placeholder="key" ref={keyRef}/>
          <div onClick={() => {debugger;boostrapNode.current.addKey(keyRef.current.value, valueRef.current.value)}}>Add</div>
        </div>
      </div>
      <div id="right" className={styles.side}>
        <div className={styles.sideHead}>Events</div>
        {events.map((event, i) => <Event key={i} {...event} node={event.node.id} />)}
      </div>
    </div>
  )
}
