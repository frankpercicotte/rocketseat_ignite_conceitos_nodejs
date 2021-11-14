const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


function checksExistsUserAccount(request, response, next) {  
  const {username} = request.headers || ""; 

  if (!username){
    return response.status(400).send({"error": `Required in headers a username!`})
  }  

  const checkUsername = users.find(elm => elm.username === username)  
  
  if (!checkUsername){
    return response.status(404).send({"error": `Username ${username} not exist!`})
  }

  request.username = username
  return next()

}

function checksTodoBody(request, response, next){
  const {title, deadline} = request.body

  if (!title || !deadline){
    return response.status(400).send({"error":"Required title and dealine."})
  }
 
  request.deadline = new Date(deadline) 
  request.title = title
  return next()
}

function checksTodoData(request, response, next){  
  todoId = request.params.id
  username = request.username

  getUser = users.find(elm => elm.username === username)  
  
  getTodo = getUser.todos.find(elm => elm.id === todoId)    
  if(!getTodo){
    return response.status(404).send({"error":`Not found this Id: ${todoId}`})
  }

  request.user = getUser
  request.todo = getTodo  
  return next()
}

app.post('/users', (request, response) => {

  const {name, username} = request.body
  if( !name || !username){
    return response.status(400).send({"error": "Required name and user!"})
  }

  const checkUsername = users.find(elm => elm.username === username)
  
  if(checkUsername){
    return response.status(400).send({"error": `Username ${username} already exist!`})
  }

  const newUser = {"id":uuidv4(), "name":name, "username":username, "todos": []}
  users.push(newUser)  

  return response.status(201).send(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  username = request.username || ""
  getTodos = users.find(elm => elm.username === username)  
  
  return response.status(200).send(getTodos.todos)

});

app.post('/todos', checksExistsUserAccount, checksTodoBody, (request, response) => {
  newdeadline = request.deadline
  title = request.title
  username = request.username
  getUser = users.find(elm => elm.username === username)

  
  newTodo = {
    "id": uuidv4(),
	  "title": title,
	  "done": false, 
	  "deadline": newdeadline, 
	  "created_at": new Date()
  }

  getUser.todos.push(newTodo)

  return response.status(201).send(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, checksTodoBody, checksTodoData, (request, response) => {    
  putTodo = request.todo
  
  putTodo.title = request.body.title
  putTodo.deadline = request.deadline

  return response.status(200).send(getTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksTodoData, (request, response) => {  
  patchTodo = request.todo
  patchTodo.done = true  

  return response.status(200).send(patchTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, checksTodoData, (request, response) => {   
  todoId = request.params.id
  user = request.user  
  
  removedTodo = user.todos.filter(elm => {return elm.id !== todoId})
  user.todos = removedTodo
  
  return response.status(204).send('')
});

module.exports = app;