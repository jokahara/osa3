const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')

app.use(bodyParser.json())

morgan.token('content', (req, res) => { 
  return JSON.stringify({ 
    "name": req.body.name, 
    "number": req.body.number
  }) 
})
app.use(morgan(':method :url :content :status :res[content-length] - :response-time ms'))

const cors = require('cors')

app.use(cors())

let persons = [
  {
    "name": "Arto Hellas",
    "number": "040-123456",
    "id": 1
  },
  {
    "name": "Martti Tienari",
    "number": "040-123456",
    "id": 2
  },
  {
    "name": "Arto Järvinen",
    "number": "040-123456",
    "id": 3
  },
  {
    "name": "Lea Kutvonen",
    "number": "040-123456",
    "id": 4
  }
]

app.get('/info', (req, res) => {
  res.send(`puhelinluettelossa ${persons.length} henkilön tiedot
            ${new Date()}`)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id )
  
  if ( person ) {
    res.json(person)
  } else {
    res.status('404').end()
  }
})

const generateId = () => {
  return Math.floor(Math.random() * 10000)
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status('400').json({error: 'name missing'})
  }

  if (persons.find(p => p.name === body.name)) {
    return response.status('400').json({error: 'name must be unique'})
  }

  if (body.number === undefined) {
    return response.status('400').json({error: 'number missing'})
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId()
  }

  persons = persons.concat(person)

  response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status('204').end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})