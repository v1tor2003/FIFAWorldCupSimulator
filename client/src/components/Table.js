import React, {useState} from "react";
import axios from 'axios'

export const Table = ({backend}) => {
  
  const GET_TEAMS = '/start'
  const [teams, setTeams] = useState([])
  const [btnText, setBtnText] = useState(0)
  
  const btnTexts = ['Start Simulation', 
                    'Simulate Phase of Groups', 
                    'Simulate Octaves', 
                    'Simulate Quarters', 
                    'Simulate Semi-Finals', 
                    'Simulate Final']

  const getTeams = () => {
    axios.get(backend + GET_TEAMS).then(
      (response) => {
        console.log(response.data)
        setBtnText(btnText + 1)
        setTeams(response.data)
      }
    ).catch(
      (error) => {
        console.log(error)
      }
    )
  }

  return (
    <div>
      <button onClick={getTeams}>{btnTexts[btnText]}</button>
    </div>
  )
}