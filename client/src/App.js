import axios from 'axios'
import React, {useState} from 'react'
import { Table } from './components/Table'

function App() {
  const severDetails = {
    BACK_END_URL: 'http://localhost:5000'
  }

  return (
    <div>
     <Table backend={severDetails.BACK_END_URL}/>
    </div>
  )
}

export default App;
