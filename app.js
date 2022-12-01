const express = require("express");
const app = express();
app.use(express.json());
module.exports = app;

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

const dbpath = path.join(__dirname, "todoApplication.db");

let db;

// initialize database and server

const initDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Online");
    });
  } catch (e) {
    console.log(`Db Error:${e.message}`);
  }
};

initDbAndServer();

// Create todo table in database

//CREATE TABLE todo (id INTEGER PRIMARY KEY,todo VARCHAR,priority VARCHAR,status VARCHAR);

// API 1 filter Todo

app.get("/todos/", async (request, response) => {
  const {
    offset = 0,
    limit = 10,
    order = "ASC",
    order_by = "",
    search_q = "",
  } = request.query;

  const getTodoQuery = `
        SELECT
          *
        FROM
         todo
        WHERE todo LIKE '%${search_q}%'
        ORDER BY ${order_by} '${order}'
        LIMIT ${limit}
        OFFSET ${offset};`;

  const result = await db.all(getTodoQuery);
  response.send(result);
});

//API 2 Select to do
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getSpecificTodo = `
    SELECT * 
    FROM todo 
    WHERE id=${todoId};`;

  const result = await db.get(getSpecificTodo);
  response.send(result);
});

// API 3  create new Todo
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;

  const createNewTodo = `
    INSERT INTO todo (id,todo,priority,status) 
    VALUES (${id},'${todo}','${priority}','${status}');`;

  const result = await db.run(createNewTodo);
  response.send("Todo Successfully Added");
});

//API 4  Update details
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;

  const updateTodo = `
        UPDATE todo SET
        todo='${todo}' WHERE id=${todoId};`;
  const updateTodoStatus = `
        UPDATE todo SET
        status='${status}' WHERE id=${todoId};`;
  const updateTodoPriority = `
        UPDATE todo SET
        priority='${priority}' WHERE id=${todoId};`;

  if (todo != undefined) {
    await db.run(updateTodo);
    response.send(`Todo Updated`);
  } else if (priority != undefined) {
    await db.run(updateTodoPriority);
    response.send(`Priority Updated`);
  } else if (status != undefined) {
    await db.run(updateTodoStatus);
    response.send("Status Updated");
  }
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
