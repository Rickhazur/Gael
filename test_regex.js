
const clean = "-8 + 15";
const addMatch = clean.match(/(-?\d+(?:\.\d+)?)\s*(\+|más|mas)\s*(-?\d+(?:\.\d+)?)/i);
console.log("Add Match:", addMatch);
const isNegative = addMatch && (addMatch[1].startsWith('-') || addMatch[3].startsWith('-'));
console.log("Is Negative:", isNegative);
const type = isNegative ? 'integer' : 'addition';
console.log("Type:", type);

const subMatch = clean.match(/(-?\d+(?:\.\d+)?)\s*([\-\−\–]|menos)\s*(-?\d+(?:\.\d+)?)/i);
console.log("Sub Match:", subMatch);
