const mongoose = require('mongoose');

const uri = "mongodb+srv://rubabarshad067:<Missmysticfalls123>@cluster0.mj2nz0m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

