const express    = require('express')
const bodyParser = require('body-parser')
const fs         = require('fs-extra')
const path       = require('path')
const app        = express()

app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

const port = process.env.PORT || 3030
const feHost = process.env.FE_HOST || 'http://localhost:8000'

app.use((req, res, next) => {
  res.set({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': feHost,
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Allow-Methods': 'OPTIONS, GET, PUT, PATCH, DELETE'
  })

  console.log(req.method + '\n    ' + req.url)
  next()
})

// GET /todo 
// Fetch todos
app.get('/todo', (req, res) => {
  fs.readJson(path.resolve(__dirname, 'todos.json'))
    .then(todos => {
      res.send(JSON.stringify(todos, null, 3))
    })
    .catch(err => {
      res.send(JSON.stringify([], null, 3))
    })
})

// POST /todo
// Insert a new todo to the database
app.post('/todo', (req, res) => {
  const mkTodo = (id) => ({
    id,
    value: req.body.value,
    done: false,
  })

  const generateUniqueId = (values = [], tryId = 0) => {
    return values.includes(tryId) ? generateUniqueId(values, tryId + 1) : tryId
  }

  fs.readJson(path.resolve(__dirname, 'todos.json'))
    .then(todos => {
      const newTodo = mkTodo( generateUniqueId(todos.map(todo => todo.id)) )

      fs.writeJson(path.resolve(__dirname, 'todos.json'), [ newTodo, ...todos ])
      res.send(JSON.stringify(newTodo, null, 3))
    })
    .catch(err => {
      const newTodo = mkTodo( generateUniqueId() )

      fs.writeJson(path.resolve(__dirname, 'todos.json'), [ newTodo ])
      res.send(JSON.stringify([ newTodo ], null, 3))
    })
})

// DELETE /todo
// Delete a todo from the database
app.delete('/todo/:todoid', (req, res) => {
  fs.readJson(path.resolve(__dirname, 'todos.json'))
    .then(todos => {
      const delId = parseInt(req.params.todoid)
      const newList = todos.filter(todo => todo.id !== delId)
      const success = newList.length !== todos.length

      if (success) {
        fs.writeJson(path.resolve(__dirname, 'todos.json'), newList)
      }
      res.send(JSON.stringify({success, todos: newList}, null, 3))
    })
    .catch (err => {
      res.send(JSON.stringify({success: false, todos: []}, null, 3))
    })
})

// PUT /todo
// Modifiy a todo
app.put('/todo/:todoid', (req, res) => {
  fs.readJson(path.resolve(__dirname, 'todos.json'))
    .then(todos => {
      const newList = todos.map(todo => todo.id === parseInt(req.params.todoid)
        ? { id: todo.id, value: req.body.value, done: req.body.done }
        : todo
      )
      fs.writeJson(path.resolve(__dirname, 'todos.json'), newList)
      res.send(JSON.stringify({todos: newList}, null, 3))
    })
    .catch (err => {
      res.send(JSON.stringify({success: false, todos: []}, null, 3))
    })
})

app.listen(port, () => {
  console.log('Listening on port ' + port)
})
