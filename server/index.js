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

app.get('/setUp/octaves', async (request, response) => {
  teams = await setUpTeamsOctaves(teams)
  response.send(teams)
})

app.get('/simulate/octaves', async (request, response) => {
  teams = await simulateOctavesMatchDays(teams)
  response.send(teams)
})

app.get('/setUp/quarters', async (request, response) => {
  teams = await setUpTeamsQuarters(teams)
  response.send(teams)
})

app.get('/simulate/quarters', async (request, response) => {
  teams = await simulateQuartersMatchDays(teams)
  response.send(teams)
})

app.get('/setUp/semis', async (request, response) => {
  teams = await setUpTeamsSemiFinals(teams)
  response.send(teams)
})

app.get('/simulate/semis', async (request, response) => {
  teams = await simulateSemiFinalsMatchDays(teams)
  response.send(teams)
})

app.get('/setUp/finals', async (request, response) => {
  teams = await setUpTeamsFinals(teams)
  response.send(teams)
})

app.get('/simulate/finals', async (request, response) => {
  teams = await simulateFinalMatchDay(teams[0])
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
  let groupsQuantity = 4,count = 0, i = 0, j = 1
  let octavesGroups = []
  // takes 16 teams from setOctaves and put them into 4 groups
  // push the new groups to the octaves array
  while(count < groupsQuantity){
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
  // this func selects 4 team each time its been invoke
  // the func runs 4 times resulting in 16 teams to be distributed by setUpTeamsOctaves(groups)
  newGroup.push(groupX.splice(startPosition, elementsQntd)[0])
  newGroup.push(groupX.splice(startPosition, elementsQntd)[0])

  newGroup.push(groupY.splice(startPosition, elementsQntd)[0])
  newGroup.push(groupY.splice(startPosition, elementsQntd)[0])
 
  return newGroup
}

function simulateOctavesMatchDays(octavesGroups){ 
  const stage = "octaves"
  const firstGroup = 0
  const secondGroup = 1
  const thirdGroup = 2
  const fourthGroup = 3

  getQualifiedsTeams(octavesGroups[firstGroup], octavesGroups[secondGroup], stage)
  getQualifiedsTeams(octavesGroups[thirdGroup], octavesGroups[fourthGroup], stage) 
 
  return octavesGroups
}

function setUpTeamsQuarters(teams){
  const firstGroup = 0
  const secondGroup = 1
  const thirdGroup = 2
  const fourthGroup = 3
  let newGroup = []
  newGroup.push(getTeamsForNextStage(teams[firstGroup], teams[secondGroup]))
  newGroup.push(getTeamsForNextStage(teams[thirdGroup], teams[fourthGroup]))
  return newGroup
}

function simulateQuartersMatchDays(quartersGroups){
  const stage = "quarters"
  const firstGroup = 0
  const secondGroup = 1
  
  getQualifiedsTeams(quartersGroups[firstGroup], quartersGroups[secondGroup], stage)

  return quartersGroups
}

function setUpTeamsSemiFinals(teams){
  const firstGroup = 0
  const secondGroup = 1
  let newGroup = []
  newGroup.push(getTeamsForNextStage(teams[firstGroup], teams[secondGroup]))
  return newGroup
}

function simulateSemiFinalsMatchDays(semiFinalsGroups){
  const stage = "semiFinals"
  const firstGroup = 0
 
  getQualifiedsTeams(semiFinalsGroups[firstGroup], null, stage)

  return semiFinalsGroups
}

function setUpTeamsFinals(teams){
  const firstGroup = 0
  let newGroup = []
  newGroup.push(getTeamsForNextStage(teams[firstGroup], null))
  return newGroup
}

function simulateFinalMatchDay(finalGroup){
  const phase = "qualifiers"
  let winner

  simulateMatch(finalGroup[0], finalGroup[1], phase)
  
  if(finalGroup[0].Qualified)
    winner = finalGroup[0]
  else
    winner = finalGroup[1]

  console.log("The team ", winner.Name, " is the winner")
  return finalGroup
}

function simulateMatch(teamHome, teamAway, phase){
  const goalsLimit = 10
  const winnerPontuation = 3
  const drawPontuation = 1

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

function getTeamsForNextStage(groupX, groupY){
  let teamsQuantity = groupX.length
  let tempGroup = []

  for(let i = 0; i < teamsQuantity; i++){
    if(groupX[i].Qualified){
      tempGroup.push(groupX[i])
    }
  }

  if(groupY){
    for(let i = 0; i < teamsQuantity; i++){
      if(groupY[i].Qualified){
        tempGroup.push(groupY[i])
      }
    }
  }

  return tempGroup
}

function getQualifiedsTeams(groupX, groupY, stage){
  //let newGroup = []
  const phase = "qualifiers"
  
  let firstX, secondX, firstY, secondY

  if(stage === "octaves"){
    firstX = 0
    secondX = 1
    firstY = 2
    secondY = 3
    
    simulateMatch(groupX[firstX], groupX[secondY], phase)
    simulateMatch(groupX[firstY], groupX[secondX], phase)
  
    simulateMatch(groupY[firstX], groupY[secondY], phase)
    simulateMatch(groupY[firstY], groupY[secondX], phase)
  }else if (stage === "quarters"){
    firstX = 0
    secondX = 1
    firstY = 3
    secondY = 2

    simulateMatch(groupX[firstX], groupX[secondY], phase)
    simulateMatch(groupX[firstY], groupX[secondX], phase)
  
    simulateMatch(groupY[firstX], groupY[secondY], phase)
    simulateMatch(groupY[firstY], groupY[secondX], phase)
  }else if(stage === "semiFinals"){
    firstX = 0
    secondX = 1
    firstY = 2
    secondY = 3

    simulateMatch(groupX[firstX], groupX[secondX], phase)
    simulateMatch(groupX[firstY], groupX[secondY], phase)
  }
  //getTeamForNextSTage will run in the next setUpStage func
}

