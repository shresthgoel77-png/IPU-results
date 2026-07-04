// cgpaCalculator.js

// Subject credit mapping for B.Tech IT & General (Expanded)
const creditMap = {
    'ES102': 3, 'BS106': 3, 'BS110': 3, 'BS112': 3, 'HS116': 2,
    'BS152': 1, 'ES154': 1, 'ES158': 1, 'BS162': 1, 'ES164': 1, 'ES114': 3,
    'BS103': 3, 'BS105': 3, 'BS107': 3, 'ES109': 3, 'ES111': 3,
    'HS113': 2, 'BS151': 1, 'BS153': 1, 'ES155': 1, 'ES157': 1, 'ES159': 1
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

    const detailedSubjects = subjects.map(sub => {
        // Remove hyphens if present to match the map (e.g., ES-102 -> ES102)
        const codeString = sub.code || '';
        const cleanCode = codeString.replace(/-/g, '');
        const credits = creditMap[cleanCode] || 3; // Fallback to 3 if unknown
        
        const gp = getGradePoint(sub.total);
        
        totalCredits += credits;
        earnedPoints += (credits * gp.points);
        totalMarks += sub.total;

        return {
            code: sub.code,
            name: sub.name,
            internal: sub.internal,
            external: sub.external,
            total: sub.total,
            credits: credits,
            grade: gp.grade
        };
    });

    const sgpa = totalCredits > 0 ? (earnedPoints / totalCredits).toFixed(2) : "0.00";
    const percentage = (sgpa * 10).toFixed(1); // GGSIPU standard conversion formula
    const maxMarks = subjects.length * 100;

    return {
        sgpa,
        percentage,
        marksFraction: `${totalMarks} / ${maxMarks}`,
        totalSubjects: subjects.length,
        detailedSubjects
    };
};

module.exports = { calculateResults };