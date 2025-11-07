import express from 'express';
import db from '../database/database.js';

const router = express.Router();

/**
 * @openapi
 * /api/program-keys:
 *   get:
 *     summary: Get all program keys
 *     description: Retrieve all discovered FM4 program keys with their metadata
 *     tags:
 *       - Program Keys
 *     responses:
 *       200:
 *         description: List of all program keys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of program keys returned
 *                   example: 42
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProgramKey'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/program-keys', (req, res) => {
  try {
    const keys = db.getAllProgramKeys();
    
    res.json({
      success: true,
      count: keys.length,
      data: keys
    });
  } catch (error) {
    console.error('[API] Error fetching program keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch program keys'
    });
  }
});

/**
 * @openapi
 * /api/program-keys/{programKey}:
 *   get:
 *     summary: Get specific program key
 *     description: Retrieve information about a specific program key
 *     tags:
 *       - Program Keys
 *     parameters:
 *       - in: path
 *         name: programKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The program key to retrieve
 *         example: 4HB
 *     responses:
 *       200:
 *         description: Program key details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProgramKey'
 *       404:
 *         description: Program key not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Program key not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/program-keys/:programKey', (req, res) => {
  try {
    const { programKey } = req.params;
    const key = db.getProgramKey(programKey);
    
    if (!key) {
      return res.status(404).json({
        success: false,
        error: 'Program key not found'
      });
    }
    
    res.json({
      success: true,
      data: key
    });
  } catch (error) {
    console.error('[API] Error fetching program key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch program key'
    });
  }
});

/**
 * @openapi
 * /api/stats:
 *   get:
 *     summary: Get statistics
 *     description: Get statistics about the program key database
 *     tags:
 *       - Statistics
 *     responses:
 *       200:
 *         description: Database statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Stats'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[API] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

export default router;
