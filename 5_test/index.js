import express from "express";

const app = express();


app.use(express.json());

let tasks = []
let id = 0

app.post("/addtask", (req, res) => {
    const {task, user} = req.body
    const newTask = {id : id++, task, user}
    tasks.push(newTask)
    res.send("task added")
})

app.get("/all-tasks", (req, res) => {
    res.send(tasks)
})

app.get("/find-task/:id", (req, res) => {
    const { id } = req.params;
    const reqTask = tasks.find(task => task.id === Number(id));
    if (!reqTask) return res.status(404).send("Task not found");
    res.send(reqTask);
});

app.put("/update-task/:id", (req, res) => {
    const { id } = req.params;
    const {task, user} = req.body;
    const matchedTask = tasks.find(task => task.id === Number(id));
    if (!matchedTask) return res.status(404).send("Task not found");
    matchedTask.task = task;
    matchedTask.user = user;
    res.status(200).json({
        message: "Task updated",
        task: matchedTask
    });
});

app.delete("/delete-task/:id", (req, res) => {
    const { id } = req.params;
    const matchedTask = tasks.find(task => task.id === Number(id));
    if (!matchedTask) return res.status(404).send("Task not found");
    tasks = tasks.filter(task => task.id !== Number(id));
    res.send("Task deleted");
});


app.listen(3000, () => {
    console.log("server is ready on port 3000")
})