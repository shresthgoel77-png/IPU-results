// cgpaCalculator.js

const creditMap = {
    // Semester 1
    'BS101': 3, 'BS103': 3, 'BS105': 3, 'BS107': 3, 'ES109': 3, 'ES111': 3,
    'HS113': 2, 'BS151': 1, 'BS153': 1, 'ES155': 1, 'ES157': 1, 'ES159': 1,
    // Semester 2
    'ES102': 3, 'BS104': 3, 'BS106': 3, 'ES108': 3, 'BS110': 3,
    'BS112': 3, 'HS114': 3, 'HS116': 2, 'ES114': 3,
    'BS152': 1, 'ES154': 1, 'BS156': 1, 'ES158': 1, 'ES160': 1, 'BS162': 1, 'ES164': 1
};

const getGradePoint = (marks) => {
    if (marks >= 90) return { grade: 'O', points: 10 };
    if (marks >= 75) return { grade: 'A+', points: 9 };
    if (marks >= 65) return { grade: 'A', points: 8 };
    if (marks >= 55) return { grade: 'B+', points: 7 };
    if (marks >= 50) return { grade: 'B', points: 6 };
    if (marks >= 45) return { grade: 'C', points: 5 };
    if (marks >= 40) return { grade: 'P', points: 4 };
    return { grade: 'F', points: 0 };
};

const calculateResults = (subjects) => {
    let totalCredits = 0;
    let earnedPoints = 0;
    let totalMarks = 0;
    let validSubjectsCount = 0;

    const detailedSubjects = [];

    subjects.forEach(sub => {
        // 1. Clean the subject code to prevent bugs
        const codeString = sub.code ? String(sub.code).toUpperCase().trim() : '';
        const cleanCode = codeString.replace(/[^A-Z0-9]/g, '');

        // 2. Destroy any garbage rows scraped from the table
        const isCodeValid = /^[A-Z]{2,3}[0-9]{3}$/.test(cleanCode);
        if (!isCodeValid) return; 

        // 3. Assign Credits
        let credits = creditMap[cleanCode];
        if (credits === undefined) {
            const numPart = parseInt(cleanCode.match(/[0-9]{3}/)[0], 10);
            if (numPart >= 150) credits = 1; 
            else if (cleanCode.startsWith('HS')) credits = 2;
            else credits = 3;
        }

        // --- THE FIX: Mathematical Forcing ---
        // Force the scraped strings into Numbers. If they are absent ("ABS"), it becomes NaN.
        let intMarks = parseInt(sub.internal, 10);
        let extMarks = parseInt(sub.external, 10);
        
        // Convert NaN to 0 so the math doesn't break
        if (isNaN(intMarks)) intMarks = 0;
        if (isNaN(extMarks)) extMarks = 0;

        // Calculate the true total natively, ignoring the scraper's string calculation
        let numericTotal = intMarks + extMarks;
        // -----------------------------------

        const gp = getGradePoint(numericTotal);
        
        totalCredits += credits;
        earnedPoints += (credits * gp.points);
        totalMarks += numericTotal;
        validSubjectsCount++;

        detailedSubjects.push({
            code: sub.code, 
            name: sub.name, 
            // Display 'ABS' on the UI if they were absent, otherwise show the number
            internal: sub.internal === '' || isNaN(parseInt(sub.internal, 10)) ? 'ABS' : intMarks,
            external: sub.external === '' || isNaN(parseInt(sub.external, 10)) ? 'ABS' : extMarks,
            total: numericTotal, 
            credits: credits, 
            grade: gp.grade, 
            points: gp.points
        });
    });

    const sgpa = totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : "0.00";
    const percentage = sgpa > 0 ? (parseFloat(sgpa) * 10).toFixed(1) : "0.0"; 
    const maxMarks = validSubjectsCount * 100;

    return {
        sgpa,
        percentage,
        marksFraction: `${totalMarks} / ${maxMarks}`,
        totalSubjects: detailedSubjects.length,
        validSubjects: validSubjectsCount,
        detailedSubjects
    };
};



module.exports = { calculateResults };