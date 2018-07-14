var express = require('express')
var app = express()
var fs = require('fs')
var path = require('path')

app.use(express.static(path.resolve(__dirname, '../build')))
app.use((req, res, next) => {
  res.set({
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET'
  })
  next()
})
const neighborhoods = require('./routes/neighborhoodRoutes')
const census_tracts = require('./routes/censusTractRoutes')

//Define what happens then a user visits the root route
app.get('/', function(req, res) {
  res.set({
    'Content-Type': 'text/html',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET'
  })
  res.sendFile(path.resolve(__dirname, '../build', 'index.html')) //Tell Express which html file to render for this route
})

app.use('/neighborhoods', neighborhoods)
app.use('/tracts', census_tracts)

app.get('/boundaries/:type/:fileName', function(req, res) {
  var file = './data/boundary_data/' + req.params['type'] + '/' + req.params['fileName'] + '.geojson'
  fs.readFile(file, function(err, content) {
    res.write(content)
    res.end()
  })
})

app.get('/violations/:fileName', function(req, res) {
  var file = './data/violations_data/geojson/' + req.params['fileName'] + '.geojson'
  fs.readFile(file, function(err, content) {
    res.write(content)
    res.end()
  })
})

app.get('/buildings/:fileName', function(req, res) {
  var file = './data/buildings_data/geojson/' + req.params['fileName'] + '.geojson'
  console.log(file)
  fs.readFile(file, function(err, content) {
    res.write(content)
    res.end()
  })
})

module.exports = { app }

