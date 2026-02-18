'use client'
import { useEffect, useState } from 'react'

export default function Pending() {

const [rows,setRows] = useState([])

async function cargar(){
 const r = await fetch('/api/pending')
 const d = await r.json()
 // handle both array and object responses
 const data = Array.isArray(d) ? d : (d.rows || d.data || [])
 setRows(data)
}

async function retry(id){
 await fetch('/api/retry',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({id})
 })
 alert('Reintentado')
 cargar()
}

useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  cargar()
}, [])

return (
<div style={{padding:40}}>
<h2>Inserciones pendientes</h2>

{rows.map(r=>(
<div key={r.id} style={{border:'1px solid #ccc',margin:10,padding:10}}>
 ID: {r.id}<br/>
 Estado: {r.status}<br/>
 <button onClick={()=>retry(r.id)}>Reintentar</button>
</div>
))}

</div>
)
}
