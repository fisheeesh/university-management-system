import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { query } from "express-validator";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

export const getAllSubjects = [
    query("search", "Invalid search value.").trim().escape().optional(),
    query("department", "Invalid department value.").trim().escape().optional(),
    query("department", "Invalid department value.").trim().escape().optional(),
    query("page", "Page must be unsigned integer.").isInt({ gt: 0 }).optional(),
    query("limit", "Limit must be greater than 10.").isInt({ gt: 10 }).optional(),
    async (req: Request, res: Response, next: NextFunction) => {
        const { search, department, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, +page)
        const limitPerPage = Math.max(10, +limit)

        // ? How many records to skip to get next page
        const offset = (currentPage - 1) * limitPerPage

        const filterCondition = []

        if (search) {
            filterCondition.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`),
                )
            )
        }

        if (department) {
            filterCondition.push(ilike(departments.name, `%${department}%`))
        }

        const whereClause = filterCondition.length ? and(...filterCondition) : undefined

        const countResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)

        const totalCount = countResult[0]?.count || 0

        const subjectsList = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset)

        res.status(200).json({
            message: "Subjects retrieved successfully.",
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage)
            }
        })
    }
]