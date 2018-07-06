const mongoose = require('mongoose')

const url = 'mongodb://puh123:fullstack1@ds127961.mlab.com:27961/puhelinluettelo'

mongoose.connect(url)

const params = process.argv

const Person = mongoose.model('Person', {
  name: String,
  number: String
})

if (params.length === 4) {
  
  const person = new Person({
    name: params[2],
    number: params[3]
  })
  
  console.log(`lisätään henkilö ${person.name} numero ${person.number} luetteloon`)
  
  person
    .save()
    .then(response => {
      console.log('person saved!')
      mongoose.connection.close()
    })
} else {
  console.log('puhelinluettelo:')
  Person
    .find({})
    .then(result => {
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
}