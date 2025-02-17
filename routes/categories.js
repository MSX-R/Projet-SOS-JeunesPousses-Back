const express = require('express')

const categoriesRouter = express.Router()
const Categorie = require('../models/categories')
const mysql = require('../config/db')

categoriesRouter.get('/', (req, res) => {
  const sql = 'SELECT id_categorie,nom_categorie FROM categories'
  const categorie = []
  mysql.query(sql, (err, result) => {
    if (err) {
      res.status(500).send('Error retrieving data from categories')
      console.error(err)
    } else {
      result.forEach(cat =>
        categorie.push({
          id: cat.id_categorie,
          value: cat.nom_categorie,
          label: cat.nom_categorie
        })
      )
      res.status(200).json(categorie)
    }
  })
})

//READ ALL
// categoriesRouter.get('/', (req, res) => {
//   Categorie.findMany()
//     .then(categories => {
//       res.json(categories)
//     })
//     .catch(err => {
//       res.status(500).send('Error retrieving categories from database')
//     })
// })

//READ ONE
categoriesRouter.get('/:id', (req, res) => {
  Categorie.findOne(req.params.id)
    .then(categorie => {
      if (categorie) {
        res.status(200).json(categorie)
      } else {
        res.status(404).send('Categorie not found')
      }
    })
    .catch(err => {
      res.status(500).send('Error retrieving categorie from database')
    })
})

// ADD ONE
categoriesRouter.post('/', (req, res) => {
  let existingCategorie = null
  let validationErrors = null
  Categorie.findCat(req.body)
    .then(categorie => {
      existingCategorie = categorie
      if (existingCategorie) return Promise.reject('DUPLICATE_DATA')
      validationErrors = Categorie.validate(req.body)
      if (validationErrors) return Promise.reject('INVALID_DATA')
      return Categorie.create(req.body)
    })
    .then(createdCategorie => {
      res.status(201).json(createdCategorie)
    })
    .catch(err => {
      console.error(err)
      if (err === 'DUPLICATE_DATA') {
        res.status(409).send('Categorie already exist')
      } else if (err === 'INVALID_DATA') {
        res.status(422).json({
          validationErrors: validationErrors.details
        })
      } else {
        res.status(500).send('Error saving the categorie')
      }
    })
})

// UPDATE ONE
categoriesRouter.put('/:id', (req, res) => {
  let existingCategorie = null
  let validationErrors = null
  Categorie.findOne(req.params.id)
    .then(categorie => {
      existingCategorie = categorie
      if (!existingCategorie) return Promise.reject('RECORD_NOT_FOUND')
      validationErrors = Categorie.validate(req.body, false)
      if (validationErrors) return Promise.reject('INVALID_DATA')
      return Categorie.update(req.params.id, req.body)
    })
    .then(() => {
      res.status(200).json({ ...existingCategorie, ...req.body })
    })
    .catch(err => {
      console.error(err)
      if (err === 'RECORD_NOT_FOUND') {
        res.status(404).send(`categorie with id ${req.params.id} not found.`)
      } else if (err === 'INVALID_DATA') {
        res.status(422).json({ validationErrors: validationErrors.details })
      } else {
        res.status(500).send('Error updating a categorie')
      }
    })
})

// DELETE ONE
categoriesRouter.delete('/:id', (req, res) => {
  Categorie.destroy(req.params.id)
    .then(deleted => {
      if (deleted) {
        res.status(200).send('🎉 Categorie deleted!')
      } else {
        res.status(404).send(`Categorie with id ${req.params.id}not found`)
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).send('Error deleting a categorie')
    })
})



module.exports = categoriesRouter
