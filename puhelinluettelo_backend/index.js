const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Person = require('./models/person')

app.use(express.static('build'))

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

/*
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
    "name": "",
    "number": "040-123456",
    "id": 3
  },
  {
    "name": "",
    "number": "040-123456",
    "id": 4
  }
]*/

app.get('/info', (request, response) => {
  Person
    .find({})
    .then(persons => {
      if (persons) {
        response.send(`puhelinluettelossa ${persons.length} henkilön tiedot
                      ${new Date()}`)
      } else {
        response.status('404').end()
      }
    })
    .catch(error => {
      console.log(error)
    })
})

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons.map(Person.format))
    })
    .catch(error => {
      console.log(error)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(Person.format(person))
      } else {
        response.status('404').end()
      }
    })
    .catch(error => {
      response.status('400').send({ error: 'malformatted id' })
    })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined) {
    return response.status('400').json({error: 'name missing'})
  }

  if (body.number === undefined) {
    return response.status('400').json({error: 'number missing'})
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  Person
    .find({ name: body.name })
    .then(found => {
      if (found.length > 0) {
        return response.status('400').json({error: 'name must be unique'})
      } else {
        person
          .save()
          .then(person => {
            response.json(Person.format(person))
          })
          .catch(error => {
            console.log(error)
          })
      }
    })
})

app.put('/api/persons/:id', (request, response) => {
  const body = request.body
  
  if (body.name === undefined) {
    return response.status('400').json({error: 'name missing'})
  }

  if (body.number === undefined) {
    return response.status('400').json({error: 'number missing'})
  }

  const person = new Person({
    _id: request.params.id,
    name: body.name,
    number: body.number
  })
  
  Person
    .findByIdAndUpdate(request.params.id, person, { new: true })
    .then(person => {
      response.json(Person.format(person))
    })
    .catch(error => {
      response.status('404').send({ error: 'malformatted id' })
    })
})

app.delete('/api/persons/:id', (request, response) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => {
      response.status('400').send({ error: 'malformatted id' })
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})