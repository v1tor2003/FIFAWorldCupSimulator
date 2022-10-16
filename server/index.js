const axios = require('axios')
const cors = require('cors') 
const express = require('express')

const PORT = 5000
const gitUser = 'v1tor2003'
const FRONT_END_URL = 'http://localhost:3000'
const EXTERNAL_API_URL = 'https://estagio.geopostenergy.com/WorldCup/GetAllTeams'

//const sortedArray = []
let teams

const app = express() 
app.use(
  cors({
    origin: FRONT_END_URL
  })
)

axios.get(EXTERNAL_API_URL, {
  headers: {
    'git-user': gitUser
  }
}).then((result) => {
  teams = result.data.Result
  console.log(teams)
}).catch((error) => {
  console.log(error)
})

app.listen(PORT, () => {console.log(`sever is live on port ${PORT}`)})

app.get('/', async (request, response) => {
  teams = await setUpTeamsTable(teams)
  response.send(teams)

})

app.get('/simulate/table', async (request, response) => {
  teams = await divideGroups(teams)
  await simulateGroupsTableMatchDays(teams)
  response.send(teams)
})

app.get('/simulate/octaves', async (request, response) => {
  teams = await setUpTeamsOctaves(teams)
  response.send(teams)
})

function setUpTeamsTable(teams){
  let sortedArray = []
  let size = teams.length, i = 0, elementsQuantity = 1

  while(i < size){
    let generatedNumber = parseInt(Math.random() * teams.length)
    let randomTeam = teams.splice(generatedNumber, elementsQuantity)[0]
    sortedArray.push(randomTeam)
    i++
  }
  addPorpertiesToTeams(sortedArray)
  return sortedArray
}

function addPorpertiesToTeams(teams){
  for(let i = 0; i < teams.length; i++){
    teams[i] = {
      Token: teams[i].Token,
      Name: teams[i].Name,
      Points: 0,
      ScoredGoals: 0,
      SufferedGoals: 0,
      Penalties: 0,
      Qualified: true
    }
  }
}

function divideGroups(teams){
  const groupsQuantity = 8 
  let groups = []

  for(let i = 0; i < groupsQuantity; i++)
    groups.push(teams.splice(0, 4))

  return groups
}

function simulateGroupsTableMatchDays(groups){
  
  for(let i = 0; i < groups.length; i++)
    groups[i] = createMatchdays(groups[i]) 
  
  orderGroupByPerformance(groups)
}

function createMatchdays(group){
  let x = 0, y = 1, z = 2, w = 3
  const phase = "table"

  simulateMatch(group[x], group[y], phase)
  simulateMatch(group[z], group[w], phase)
  
  simulateMatch(group[z], group[y], phase)
  simulateMatch(group[x], group[w], phase)
  
  simulateMatch(group[w], group[y], phase)
  simulateMatch(group[x], group[z], phase)
  
  return group
}

function orderGroupByPerformance(groups){
  for(let i = 0; i < groups.length; i++){
    groups[i].sort(function(a, b){
      return b.Points - a.Points
    })
    resolveTableDraw(groups[i])
    findQualifieds(groups[i])
  }
}

function findQualifieds(group){
  for(let i = 0; i < group.length; i++){
    if(i > 1){
      group[i].Qualified = false
    }
  }
}

function resolveTableDraw(group){
  let i= 0
  while(i+1 < group.length){
      if((group[i].Points === group[i+1].Points) && (group[i].Qualified == true)){
          if((group[i+1].ScoredGoals - group[i+1].SufferedGoals) > (group[i].ScoredGoals - group[i].SufferedGoals)){
            let temp = group[i]
            group[i] = group[i+1]
            group[i+1] = temp
          }else if((group[i+1].ScoredGoals - group[i+1].SufferedGoals) === (group[i].ScoredGoals - group[i].SufferedGoals)){
            let getQualifiedTeam = parseInt(Math.random() * 1)
            if(getQualifiedTeam === 0){
              let temp = group[i]
              group[i] = group[i+1]
              group[i+1] = temp
            }
          }
      }
    i++
  }
}

function setUpTeamsOctaves(groups){
  let count = 0, i = 0, j = 1
  let octavesGroups = []
// push the new groups to the octaves array
  while(count < 4){
    octavesGroups.push(setOctaves(groups[i], groups[j]))
    i = j + 1
    j = i + 1
    count++
  }

  return octavesGroups
}

function setOctaves(groupX, groupY){
  const startPosition = 0
  const elementsQntd = 1
  let newGroup = []
  
  newGroup.push(groupX.splice(startPosition, elementsQntd)[0])
  newGroup.push(groupX.splice(startPosition, elementsQntd)[0])

  newGroup.push(groupY.splice(startPosition, elementsQntd)[0])
  newGroup.push(groupY.splice(startPosition, elementsQntd)[0])
 
  return newGroup
}

function simulateMatch(teamHome, teamAway, phase){
  const goalsLimit = 10
  const winnerPontuation = 3
  const drawPontuation = 1
  console.log(teamHome, teamAway)
  let matchGoalsHome = parseInt(Math.random() * goalsLimit)
  let matchGoalsAway = parseInt(Math.random() * goalsLimit)
  switch(phase){
    case 'table':
      if(matchGoalsHome < matchGoalsAway){
        teamAway.Points += winnerPontuation
      }else if(matchGoalsAway < matchGoalsHome){
        teamHome.Points += winnerPontuation
      }else{
        teamHome.Points += drawPontuation
        teamAway.Points += drawPontuation
      }
      
      teamHome.ScoredGoals += matchGoalsHome
      teamHome.SufferedGoals += matchGoalsAway
      
      teamAway.ScoredGoals += matchGoalsAway
      teamAway.SufferedGoals += matchGoalsHome
      break
    case 'qualifiers':
      teamHome.Penalties = 0
      teamAway.Penalties = 0

      teamHome.ScoredGoals = matchGoalsHome
      teamAway.ScoredGoals = matchGoalsAway

      teamHome.SufferedGoals = matchGoalsAway
      teamAway.SufferedGoals = matchGoalsHome

      if(matchGoalsHome < matchGoalsAway){
        teamHome.Qualified = false
      }else if(matchGoalsAway < matchGoalsHome){
        teamAway.Qualified = false
      }else{
        simulatePenalties(teamHome, teamAway)
      }
      break
  }
}

function simulatePenalties(teamHome, teamAway){
  const penatiesLimit = 5
  const alternatingPenaltiesLimit = 1
  let convertedPenaltiesHome = parseInt(Math.random() * penatiesLimit)
  let convertedPenaltiesAway = parseInt(Math.random() * penatiesLimit)
  
  while(convertedPenaltiesAway === convertedPenaltiesHome){
    convertedPenaltiesHome += parseInt(Math.random() * alternatingPenaltiesLimit)
    convertedPenaltiesAway += parseInt(Math.random() * alternatingPenaltiesLimit)
  }
  
  teamHome.Penalties = convertedPenaltiesHome
  teamAway.Penalties = convertedPenaltiesAway

  if(convertedPenaltiesHome > convertedPenaltiesAway){
    teamAway.Qualified = false
  }else{
    teamHome.Qualified = false
  }
}

function getQualifiedsTeams(resultantArray, groupX, groupY, stage){
  let newGroup = []
  const phase = "qualifiers"
  
  let firstX, secondX, firstY, secondY

  if(stage === "toQuarters"){
    firstX = 0
    secondX = 1
    firstY = 2
    secondY = 3
    
    simulateMatch(groupX[firstX], groupX[secondY], phase)
    simulateMatch(groupX[firstY], groupX[secondX], phase)
  
    simulateMatch(groupY[firstX], groupY[secondY], phase)
    simulateMatch(groupY[firstY], groupY[secondX], phase)
  }else if (stage === "toSemiFinal"){
    firstX = 0
    secondX = 1
    firstY = 3
    secondY = 2

    simulateMatch(groupX[firstX], groupX[secondY], phase)
    simulateMatch(groupX[firstY], groupX[secondX], phase)
  
    simulateMatch(groupY[firstX], groupY[secondY], phase)
    simulateMatch(groupY[firstY], groupY[secondX], phase)
  }else if(stage === "toFinal"){
    firstX = 0
    secondX = 1
    firstY = 2
    secondY = 3

    simulateMatch(groupX[firstX], groupX[secondX], phase)
    simulateMatch(groupX[firstY], groupX[secondY], phase)
  }

  
  let teamsQuantity = groupX.length

  for(let i = 0; i < teamsQuantity; i++){
    if(groupX[i].Qualified){
      newGroup.push(groupX[i])
    }
  }

  if(groupY){
    for(let i = 0; i < teamsQuantity; i++){
      if(groupY[i].Qualified){
        newGroup.push(groupY[i])
      }
    }
  }
  resultantArray.push(newGroup)
   
}

