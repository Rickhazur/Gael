
const { AdditionTutor } = require('./services/tutors/AdditionTutor');
const { AnswerValidator } = require('./services/tutors/utils');

// Mock AnswerValidator to behave like the real one
const mockHistory = [
    { role: 'user', content: '12345 + 12345' },
    { role: 'assistant', content: '¡Misión Suma activada! ... ¿Cuánto es 5 + 5? [VISUAL_STATE] result=""' },
    { role: 'user', content: '10' },
    { role: 'assistant', content: 'Bien! 5 + 5 = 10. Escribimos 0 y llevamos 1... Vamos con las decenas [VISUAL_STATE] result="0"' }
];

const prob = { n1: '12345', n2: '12345', isNew: false };
const input = '9'; // User answer for tens column (4+4+1)

const resp = AdditionTutor.handleAddition(input, prob, 'es', mockHistory, 'TestStudent');

console.log('--- TEST: 12345 + 12345 ---');
console.log('Input:', input);
console.log('Current History length:', mockHistory.length);
if (resp) {
    console.log('Response Text:', resp.steps[0].text);
    console.log('Is Success?', !resp.steps[0].text.includes('casi') && !resp.steps[0].text.includes('cerca'));
} else {
    console.log('No response');
}
