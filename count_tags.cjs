
const fs = require('fs');
const content = fs.readFileSync('components/LanguageCenter/FarmZone.tsx', 'utf8');

function count(regex) {
    const matches = content.match(regex);
    return matches ? matches.length : 0;
}

const divOpen = count(/<div(?!\w)/g);
const divClose = count(/<\/div\s*>/g);
const motionDivOpen = count(/<motion\.div(?!\w)/g);
const motionDivClose = count(/<\/motion\.div\s*>/g);
const selfClosingDiv = count(/<div[^>]*\/>/g);
const selfClosingMotionDiv = count(/<motion\.div[^>]*\/>/g);

console.log(`Divs: Open=${divOpen}, Close=${divClose}, SelfClosing=${selfClosingDiv}`);
console.log(`Motion Divs: Open=${motionDivOpen}, Close=${motionDivClose}, SelfClosing=${selfClosingMotionDiv}`);
console.log(`Net Divs: ${divOpen - divClose - selfClosingDiv}`);
console.log(`Net Motion Divs: ${motionDivOpen - motionDivClose - selfClosingMotionDiv}`);
