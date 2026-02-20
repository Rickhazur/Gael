
// Test script for AlgorithmicTutor
import { AlgorithmicTutor } from './services/algorithmicTutor';

const userInput = "14+15";
const history = [];
const language = 'es';

console.log("Testing Input:", userInput);

try {
    const result = AlgorithmicTutor.generateResponse(userInput, history, language);
    console.log("Result:", JSON.stringify(result, null, 2));
} catch (e) {
    console.error("Error:", e);
}
