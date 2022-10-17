import React, {useState} from "react";
import axios from 'axios'

export const Table = ({backend}) => {

  const [teams, setTeams] = useState([])
  const [endPoint, setEndPoint] = useState(0)
  const texts = ['/', '/simulate/table', '/setUp/octaves'
                , '/simulate/octaves', '/setUp/quarters'
                , '/simulate/quarters', '/setUp/semis'
                , '/simulate/semis', '/setUp/finals'
                , '/simulate/finals']
 
  const getTeams = () => {
    axios.get(backend + texts[endPoint]).then(
      (response) => {
        console.log(response.data)
        setTeams(response.data)
        setEndPoint(endPoint + 1)
      }
    ).catch(
      (error) => {
        console.log(error)
      }
    )
  }

  return (
   <React.Fragment>
    <button onClick={getTeams}>Simulate</button>
    <ul>
      {teams.map(team => {
        return (
          <li key={team.Name}>
            {team.Qualified ? <p style={{color: "green"}}>Team: {team.Name}, Last Match: Win ({team.ScoredGoals} x {team.SufferedGoals})</p> : <p style={{color: "red"}}>Team: {team.Name}, Last Match: Loss ({team.ScoredGoals} x {team.SufferedGoals})</p>}
          </li>
          )
      })}
    </ul>
    </React.Fragment>
  )
}