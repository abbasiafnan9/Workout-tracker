const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require('path');

const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true });

app.get('/exercise', (req,res) => {
  res.sendFile(path.join(__dirname,"public/exercise.html"))
});
app.get('/stats', (req,res) => {
  res.sendFile(path.join(__dirname,"public/stats.html"))
});

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname,"public/index.html"))
});

app.get('/api/workouts',(req,res) => {
  db.Workout.findOne({$sort: {day: -1}})
  .populate('exercises').then(data => res.json(data))
  .catch(err=>res.json(err))
});
app.put('/api/workouts/:id',(req,res) => {
  db.Exercise.create(req.body)
    .then((data) => {
      console.log(data);
      db.Workout.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),{$push: {exercises:data._id}},{new: true})
      .then(dbWorkout => {
        console.log(dbWorkout);
        res.json(dbWorkout);
      })
      .catch(err=> res.json(err));
    })
});
app.post("/api/workouts", (req,res) => {
  db.Workout.create(req.body, (err,data) =>{
    if(err) {
      res.json(err)
    } else {
      res.json(data)
    }
  })
});
app.get('/api/workouts/range',(req,res) => {
  db.Workout.aggregate([{$addFields:{totalDuration:{$sum:'$exercises.duration'}}}])
    // .populate("exercises")
    .then(data => {console.log(data); res.json(data)})
    .catch(err=> res.json(err))
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
  });