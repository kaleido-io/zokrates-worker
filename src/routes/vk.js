import express from 'express';
import { getVerificationKeyByCircuitPath } from '../utils/filing.js';

const router = express.Router();

/**
 * @param {string} circuitName is the name of the circuit (e.g. myCircuit); note no `.zok` extension.

*/
router.get('/', async (req, res, next) => {
  try {
    console.log(`\nReceived request to /vk`);
    console.log('Body:', req.body);
    const { folderpath } = req.body;
    const vk = getVerificationKeyByCircuitPath(folderpath);
    console.log('\nReturning vk:');
    console.log(vk);
    return res.send({ vk });
  } catch (err) {
    return next(err);
  }
});

export default router;
