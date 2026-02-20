import fs from 'fs';
const path = 'c:/Users/devel/OneDrive/Desktop/Nova-Schola-Elementary-main/services/tutors/FractionTutor.ts';
let s = fs.readFileSync(path, 'utf8');
s = s.replace(/\u201C/g, '"').replace(/\u201D/g, '"');
fs.writeFileSync(path, s);
console.log('Replaced curly quotes in FractionTutor.ts');
