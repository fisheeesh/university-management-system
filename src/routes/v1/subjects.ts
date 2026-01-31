import express from 'express'
import { getAllSubjects } from '../../controllers/subject.controller'

const router = express.Router()

router.get("/subjects", getAllSubjects)

export default router