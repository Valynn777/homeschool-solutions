/**
 * Faithful Way Homeschool Solutions
 * Interactive Tools JavaScript
 *
 * This file contains functionality for all homeschool planning tools.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Tools module initialized');

    // Initialize Tool 1: Transcript Generator
    initializeTranscriptGenerator();

    // Initialize Tool 2: Schedule Builder
    initializeScheduleBuilder();
});

/* ============================================
   Tool 1: Transcript Generator
   ============================================ */

function initializeTranscriptGenerator() {
    const form = document.getElementById('transcriptForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get student information
        const studentName = document.getElementById('studentName').value;
        const graduationYear = document.getElementById('graduationYear').value;
        const studentDOB = document.getElementById('studentDOB').value;
        const schoolName = document.getElementById('schoolName').value || 'Homeschool Academy';
        const studentID = document.getElementById('studentID').value;
        const studentAddress = document.getElementById('studentAddress').value;

        // Get all courses
        const courseGrades = form.querySelectorAll('select[name="courseGrade[]"]');
        const courseNames = form.querySelectorAll('input[name="courseName[]"]');
        const courseLetterGrades = form.querySelectorAll('select[name="courseLetterGrade[]"]');
        const coursePercentages = form.querySelectorAll('input[name="coursePercentage[]"]');
        const courseCredits = form.querySelectorAll('input[name="courseCredits[]"]');

        const courses = [];
        for (let i = 0; i < courseNames.length; i++) {
            if (courseNames[i].value && courseGrades[i].value && courseLetterGrades[i].value && courseCredits[i].value) {
                courses.push({
                    grade: courseGrades[i].value,
                    name: courseNames[i].value,
                    letterGrade: courseLetterGrades[i].value,
                    percentage: coursePercentages[i].value ? parseFloat(coursePercentages[i].value) : null,
                    credits: parseFloat(courseCredits[i].value)
                });
            }
        }

        // Generate transcript
        const transcript = generateTranscript({
            studentName,
            graduationYear,
            studentDOB,
            schoolName,
            studentID,
            studentAddress,
            courses
        });

        // Display output
        const outputDiv = document.getElementById('transcriptOutput');
        const contentDiv = document.getElementById('transcriptContent');

        contentDiv.innerHTML = transcript;
        outputDiv.style.display = 'block';

        // Scroll to output
        outputDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

function addCourse() {
    const container = document.getElementById('coursesContainer');
    const courseHTML = `
        <div class="course-entry" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
            <div class="form-row">
                <div class="form-group">
                    <label>Grade Level *</label>
                    <select name="courseGrade[]" required>
                        <option value="">Select grade</option>
                        <option value="9">9th Grade</option>
                        <option value="10">10th Grade</option>
                        <option value="11">11th Grade</option>
                        <option value="12">12th Grade</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Course Name *</label>
                    <input type="text" name="courseName[]" required placeholder="e.g., Algebra I">
                </div>
                <div class="form-group">
                    <label>Grade *</label>
                    <select name="courseLetterGrade[]" required>
                        <option value="">Select</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="B-">B-</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="C-">C-</option>
                        <option value="D+">D+</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                        <option value="P">P (Pass)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Percentage</label>
                    <input type="number" name="coursePercentage[]" placeholder="95" step="0.01" min="0" max="100">
                </div>
                <div class="form-group">
                    <label>Credits *</label>
                    <input type="number" name="courseCredits[]" required placeholder="1.0" step="0.25" min="0" max="5">
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', courseHTML);
}

function loadSampleData() {
    // Fill in student information
    document.getElementById('studentName').value = 'Sarah Johnson';
    document.getElementById('graduationYear').value = '2025';
    document.getElementById('studentDOB').value = '2006-09-15';
    document.getElementById('schoolName').value = 'Faithful Way Homeschool Academy';
    document.getElementById('studentID').value = 'FW-2025-001';
    document.getElementById('studentAddress').value = '123 Maple Street, Springfield, IL 62701';

    // Clear existing courses
    const container = document.getElementById('coursesContainer');
    container.innerHTML = '';

    // Sample course data: [grade, name, letterGrade, percentage, credits]
    const sampleCourses = [
        // 9th Grade
        ['9', 'Algebra I', 'A', 94, 1.0],
        ['9', 'Biology', 'A-', 92, 1.0],
        ['9', 'World History', 'A', 96, 1.0],
        ['9', 'English I: Literature & Composition', 'A', 95, 1.0],
        ['9', 'Spanish I', 'B+', 89, 1.0],
        ['9', 'Physical Education', 'P', null, 0.5],

        // 10th Grade
        ['10', 'Geometry', 'A', 93, 1.0],
        ['10', 'Chemistry', 'A-', 91, 1.0],
        ['10', 'American History', 'A', 97, 1.0],
        ['10', 'English II: World Literature', 'A', 94, 1.0],
        ['10', 'Spanish II', 'B+', 88, 1.0],
        ['10', 'Art Appreciation', 'A', 98, 0.5],

        // 11th Grade
        ['11', 'Algebra II', 'A-', 90, 1.0],
        ['11', 'Physics', 'B+', 87, 1.0],
        ['11', 'U.S. Government', 'A', 96, 0.5],
        ['11', 'Economics', 'A', 95, 0.5],
        ['11', 'English III: American Literature', 'A', 94, 1.0],
        ['11', 'Spanish III', 'B', 85, 1.0],
        ['11', 'Music Theory', 'A-', 91, 0.5],

        // 12th Grade
        ['12', 'Pre-Calculus', 'A', 93, 1.0],
        ['12', 'Anatomy & Physiology', 'A', 95, 1.0],
        ['12', 'American Government', 'A', 97, 0.5],
        ['12', 'English IV: British Literature', 'A-', 92, 1.0],
        ['12', 'Bible Studies', 'A', 98, 0.5],
        ['12', 'Computer Science Fundamentals', 'A', 96, 0.5]
    ];

    // Add courses
    sampleCourses.forEach((course, index) => {
        const [grade, name, letterGrade, percentage, credits] = course;

        const courseHTML = `
            <div class="course-entry" style="${index > 0 ? 'margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;' : ''}">
                <div class="form-row">
                    <div class="form-group">
                        <label>Grade Level *</label>
                        <select name="courseGrade[]" required>
                            <option value="">Select grade</option>
                            <option value="9" ${grade === '9' ? 'selected' : ''}>9th Grade</option>
                            <option value="10" ${grade === '10' ? 'selected' : ''}>10th Grade</option>
                            <option value="11" ${grade === '11' ? 'selected' : ''}>11th Grade</option>
                            <option value="12" ${grade === '12' ? 'selected' : ''}>12th Grade</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Course Name *</label>
                        <input type="text" name="courseName[]" required placeholder="e.g., Algebra I" value="${name}">
                    </div>
                    <div class="form-group">
                        <label>Grade *</label>
                        <select name="courseLetterGrade[]" required>
                            <option value="">Select</option>
                            <option value="A" ${letterGrade === 'A' ? 'selected' : ''}>A</option>
                            <option value="A-" ${letterGrade === 'A-' ? 'selected' : ''}>A-</option>
                            <option value="B+" ${letterGrade === 'B+' ? 'selected' : ''}>B+</option>
                            <option value="B" ${letterGrade === 'B' ? 'selected' : ''}>B</option>
                            <option value="B-" ${letterGrade === 'B-' ? 'selected' : ''}>B-</option>
                            <option value="C+" ${letterGrade === 'C+' ? 'selected' : ''}>C+</option>
                            <option value="C" ${letterGrade === 'C' ? 'selected' : ''}>C</option>
                            <option value="C-" ${letterGrade === 'C-' ? 'selected' : ''}>C-</option>
                            <option value="D+" ${letterGrade === 'D+' ? 'selected' : ''}>D+</option>
                            <option value="D" ${letterGrade === 'D' ? 'selected' : ''}>D</option>
                            <option value="F" ${letterGrade === 'F' ? 'selected' : ''}>F</option>
                            <option value="P" ${letterGrade === 'P' ? 'selected' : ''}>P (Pass)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Percentage</label>
                        <input type="number" name="coursePercentage[]" placeholder="95" step="0.01" min="0" max="100" value="${percentage !== null ? percentage : ''}">
                    </div>
                    <div class="form-group">
                        <label>Credits *</label>
                        <input type="number" name="courseCredits[]" required placeholder="1.0" step="0.25" min="0" max="5" value="${credits}">
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', courseHTML);
    });

    // Show success message
    alert('Sample data loaded! You can now generate the transcript or modify the data as needed.');
}

function generateTranscript(data) {
    const { studentName, graduationYear, studentDOB, schoolName, studentID, studentAddress, courses } = data;

    // GPA scale
    const gradePoints = {
        'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0,
        'F': 0.0, 'P': null // P (Pass) doesn't count toward GPA
    };

    // Group courses by grade level
    const coursesByGrade = {
        '9': [], '10': [], '11': [], '12': []
    };

    let totalCredits = 0;
    let totalGradePoints = 0;
    let creditsForGPA = 0;

    courses.forEach(course => {
        coursesByGrade[course.grade].push(course);
        totalCredits += course.credits;

        // Calculate GPA (exclude Pass grades)
        if (gradePoints[course.letterGrade] !== null) {
            totalGradePoints += gradePoints[course.letterGrade] * course.credits;
            creditsForGPA += course.credits;
        }
    });

    const cumulativeGPA = creditsForGPA > 0 ? (totalGradePoints / creditsForGPA).toFixed(3) : '0.000';

    // Format date of birth
    const dobFormatted = studentDOB ? new Date(studentDOB).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    }) : '';

    // Generate course rows for a grade level (for two-column layout)
    function generateGradeRows(gradeLevel, gradeName) {
        const gradeCourses = coursesByGrade[gradeLevel];
        if (gradeCourses.length === 0) return { rows: '', credits: 0, gpa: 0, gradePoints: 0 };

        let gradeCredits = 0;
        let gradeGradePoints = 0;
        let gradeCreditsForGPA = 0;

        gradeCourses.forEach(course => {
            gradeCredits += course.credits;
            if (gradePoints[course.letterGrade] !== null) {
                gradeGradePoints += gradePoints[course.letterGrade] * course.credits;
                gradeCreditsForGPA += course.credits;
            }
        });

        const gradeGPA = gradeCreditsForGPA > 0 ? (gradeGradePoints / gradeCreditsForGPA).toFixed(2) : '0.00';

        const rows = gradeCourses.map(course => {
            const gp = gradePoints[course.letterGrade] !== null ? gradePoints[course.letterGrade].toFixed(2) : '-';
            return `
                <tr>
                    <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; font-size: 0.7rem;">${course.name}</td>
                    <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem; font-weight: 600;">${course.letterGrade}</td>
                    <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course.credits}</td>
                    <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${gp}</td>
                </tr>
            `;
        }).join('');

        return { rows, credits: gradeCredits, gpa: gradeGPA, gradePoints: gradeGradePoints };
    }

    // Get data for each grade
    const grade9 = generateGradeRows('9', 'Freshman (9th Grade)');
    const grade10 = generateGradeRows('10', 'Sophomore (10th Grade)');
    const grade11 = generateGradeRows('11', 'Junior (11th Grade)');
    const grade12 = generateGradeRows('12', 'Senior (12th Grade)');

    return `
        <div class="transcript-content" style="max-width: 8.5in; margin: 0 auto; padding: 0.35in; font-family: Arial, sans-serif;">
            <!-- Header -->
            <div style="text-align: center; padding: 0.3rem; background: #2c3e50; color: white; margin-bottom: 0.4rem;">
                <h1 style="margin: 0; font-size: 1.2rem; font-weight: 700; letter-spacing: 1px;">OFFICIAL TRANSCRIPT</h1>
            </div>

            <!-- School and Student Information Grid -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 0.4rem; border: 2px solid #2c3e50;">
                <tr>
                    <td colspan="2" style="background: #34495e; color: white; padding: 0.2rem 0.4rem; font-size: 0.75rem; font-weight: 700; border: 1px solid #2c3e50;">SCHOOL INFORMATION</td>
                    <td colspan="2" style="background: #34495e; color: white; padding: 0.2rem 0.4rem; font-size: 0.75rem; font-weight: 700; border: 1px solid #2c3e50;">STUDENT INFORMATION</td>
                </tr>
                <tr>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; width: 18%; border: 1px solid #cbd5e1; background: #f8f9fa;">School Name:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; width: 32%; border: 1px solid #cbd5e1;">${schoolName}</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; width: 18%; border: 1px solid #cbd5e1; background: #f8f9fa;">Student Name:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; width: 32%; border: 1px solid #cbd5e1;">${studentName}</td>
                </tr>
                <tr>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Address:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1;">${studentAddress || ''}</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">D.O.B:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1;">${dobFormatted}</td>
                </tr>
                <tr>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Email:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1;"></td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Email:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1;"></td>
                </tr>
                <tr>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Phone #:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1;"></td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Phone #:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1;"></td>
                </tr>
            </table>

            <!-- Academic History - Two Column Layout -->
            <table style="width: 100%; border-collapse: collapse; border: 2px solid #2c3e50;">
                <tr>
                    <td colspan="8" style="background: #34495e; color: white; padding: 0.25rem 0.4rem; font-size: 0.8rem; font-weight: 700; text-align: center; border: 1px solid #2c3e50;">ACADEMIC HISTORY</td>
                </tr>

                <!-- Column Headers -->
                <tr>
                    <td colspan="4" style="background: #5d6d7e; color: white; padding: 0.2rem; text-align: center; font-size: 0.7rem; font-weight: 600; border: 1px solid #2c3e50;">Freshman (9th Grade)<br>Year: ${grade9.credits > 0 ? '' : ''}</td>
                    <td colspan="4" style="background: #5d6d7e; color: white; padding: 0.2rem; text-align: center; font-size: 0.7rem; font-weight: 600; border: 1px solid #2c3e50;">Sophomore (10th Grade)<br>Year: ${grade10.credits > 0 ? '' : ''}</td>
                </tr>
                <tr style="background: #85929e; color: white;">
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; border: 1px solid #5d6d7e;">Course Title</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; width: 50px; border: 1px solid #5d6d7e;">Grade</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; width: 45px; border: 1px solid #5d6d7e;">Unit</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; width: 45px; border: 1px solid #5d6d7e;">GP</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; border: 1px solid #5d6d7e;">Course Title</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; width: 50px; border: 1px solid #5d6d7e;">Grade</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; width: 45px; border: 1px solid #5d6d7e;">Unit</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; width: 45px; border: 1px solid #5d6d7e;">GP</td>
                </tr>

                ${grade9.rows || grade10.rows ?
                    Math.max(
                        coursesByGrade['9'].length,
                        coursesByGrade['10'].length
                    ) > 0 ?
                    Array.from({length: Math.max(coursesByGrade['9'].length, coursesByGrade['10'].length)}).map((_, i) => {
                        const course9 = coursesByGrade['9'][i];
                        const course10 = coursesByGrade['10'][i];
                        const gp9 = course9 && gradePoints[course9.letterGrade] !== null ? gradePoints[course9.letterGrade].toFixed(2) : '';
                        const gp10 = course10 && gradePoints[course10.letterGrade] !== null ? gradePoints[course10.letterGrade].toFixed(2) : '';

                        return `
                        <tr>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; font-size: 0.7rem;">${course9 ? course9.name : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem; font-weight: 600;">${course9 ? course9.letterGrade : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course9 ? course9.credits : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course9 ? gp9 : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; font-size: 0.7rem;">${course10 ? course10.name : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem; font-weight: 600;">${course10 ? course10.letterGrade : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course10 ? course10.credits : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course10 ? gp10 : ''}</td>
                        </tr>
                        `;
                    }).join('') : '' : ''}

                <!-- Totals for 9th and 10th -->
                <tr style="background: #ecf0f1; font-weight: 700;">
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: right;">Totals/Averages:</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: center;">${grade9.gpa}</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: center;">${grade9.credits.toFixed(1)}</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem;"></td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: right;">Totals/Averages:</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: center;">${grade10.gpa}</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: center;">${grade10.credits.toFixed(1)}</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem;"></td>
                </tr>

                <!-- Junior and Senior Headers -->
                <tr>
                    <td colspan="4" style="background: #5d6d7e; color: white; padding: 0.2rem; text-align: center; font-size: 0.7rem; font-weight: 600; border: 1px solid #2c3e50;">Junior (11th Grade)<br>Year: ${grade11.credits > 0 ? '' : ''}</td>
                    <td colspan="4" style="background: #5d6d7e; color: white; padding: 0.2rem; text-align: center; font-size: 0.7rem; font-weight: 600; border: 1px solid #2c3e50;">Senior (12th Grade)<br>Year: ${grade12.credits > 0 ? '' : ''}</td>
                </tr>
                <tr style="background: #85929e; color: white;">
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; border: 1px solid #5d6d7e;">Course Title</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; border: 1px solid #5d6d7e;">Grade</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; border: 1px solid #5d6d7e;">Unit</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; border: 1px solid #5d6d7e;">GP</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; border: 1px solid #5d6d7e;">Course Title</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; border: 1px solid #5d6d7e;">Grade</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; border: 1px solid #5d6d7e;">Unit</td>
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; font-weight: 600; text-align: center; border: 1px solid #5d6d7e;">GP</td>
                </tr>

                ${grade11.rows || grade12.rows ?
                    Math.max(
                        coursesByGrade['11'].length,
                        coursesByGrade['12'].length
                    ) > 0 ?
                    Array.from({length: Math.max(coursesByGrade['11'].length, coursesByGrade['12'].length)}).map((_, i) => {
                        const course11 = coursesByGrade['11'][i];
                        const course12 = coursesByGrade['12'][i];
                        const gp11 = course11 && gradePoints[course11.letterGrade] !== null ? gradePoints[course11.letterGrade].toFixed(2) : '';
                        const gp12 = course12 && gradePoints[course12.letterGrade] !== null ? gradePoints[course12.letterGrade].toFixed(2) : '';

                        return `
                        <tr>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; font-size: 0.7rem;">${course11 ? course11.name : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem; font-weight: 600;">${course11 ? course11.letterGrade : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course11 ? course11.credits : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course11 ? gp11 : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; font-size: 0.7rem;">${course12 ? course12.name : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem; font-weight: 600;">${course12 ? course12.letterGrade : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course12 ? course12.credits : ''}</td>
                            <td style="padding: 0.15rem 0.3rem; border: 1px solid #cbd5e1; text-align: center; font-size: 0.7rem;">${course12 ? gp12 : ''}</td>
                        </tr>
                        `;
                    }).join('') : '' : ''}

                <!-- Totals for 11th and 12th -->
                <tr style="background: #ecf0f1; font-weight: 700;">
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: right;">Totals/Averages:</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: center;">${grade11.gpa}</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: center;">${grade11.credits.toFixed(1)}</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem;"></td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: right;">Totals/Averages:</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: center;">${grade12.gpa}</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem; text-align: center;">${grade12.credits.toFixed(1)}</td>
                    <td style="padding: 0.2rem 0.3rem; border: 1px solid #2c3e50; font-size: 0.7rem;"></td>
                </tr>
            </table>

            <!-- Summary and Grading Scale -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 0.4rem; border: 2px solid #2c3e50;">
                <tr>
                    <td colspan="6" style="background: #34495e; color: white; padding: 0.2rem 0.4rem; font-size: 0.75rem; font-weight: 700; text-align: center; border: 1px solid #2c3e50;">SUMMARY</td>
                </tr>
                <tr>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Graduation Date:</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1;">${graduationYear}</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Total Graduation Units</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1; text-align: center; font-weight: 700;">${totalCredits.toFixed(1)}</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Cumulative GPA</td>
                    <td style="padding: 0.2rem 0.4rem; font-size: 0.7rem; border: 1px solid #cbd5e1; text-align: center; font-weight: 700;">${cumulativeGPA}</td>
                </tr>
            </table>

            <!-- Grading Scale -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 0.4rem; border: 2px solid #2c3e50;">
                <tr>
                    <td colspan="8" style="background: #34495e; color: white; padding: 0.2rem 0.4rem; font-size: 0.75rem; font-weight: 700; text-align: center; border: 1px solid #2c3e50;">GRADING SCALE</td>
                </tr>
                <tr style="background: #f8f9fa;">
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; text-align: center; border: 1px solid #cbd5e1; font-weight: 600;">Grading System</td>
                    <td colspan="7" style="padding: 0.2rem 0.3rem; font-size: 0.65rem; border: 1px solid #cbd5e1;"><strong>A</strong> = 90-100 <strong>B</strong> = 80-89 <strong>C</strong> = 70-79 <strong>D</strong> = 60-69</td>
                </tr>
                <tr style="background: #f8f9fa;">
                    <td style="padding: 0.2rem 0.3rem; font-size: 0.65rem; text-align: center; border: 1px solid #cbd5e1; font-weight: 600;">GPA Scale</td>
                    <td colspan="7" style="padding: 0.2rem 0.3rem; font-size: 0.65rem; border: 1px solid #cbd5e1;"><strong>A</strong> = 4.00 <strong>B</strong> = 3.00 <strong>C</strong> = 2.00 <strong>D</strong> = 1.00</td>
                </tr>
            </table>

            <!-- Signatures -->
            <table style="width: 100%; border-collapse: collapse; margin-top: 0.4rem; border: 2px solid #2c3e50;">
                <tr>
                    <td colspan="3" style="background: #34495e; color: white; padding: 0.2rem 0.4rem; font-size: 0.75rem; font-weight: 700; text-align: center; border: 1px solid #2c3e50;">SIGNATURES</td>
                </tr>
                <tr>
                    <td style="padding: 0.15rem 0.3rem; font-size: 0.7rem; font-weight: 600; border: 1px solid #cbd5e1; background: #f8f9fa;">Home Educator's Name/Signature:</td>
                    <td style="padding: 0.15rem 0.3rem; font-size: 0.7rem; border: 1px solid #cbd5e1; width: 30%;"></td>
                    <td style="padding: 0.15rem 0.3rem; font-size: 0.7rem; border: 1px solid #cbd5e1; width: 20%;"></td>
                </tr>
                <tr>
                    <td style="padding: 0rem; font-size: 0.6rem; text-align: right; border: none; color: #666;"></td>
                    <td style="padding: 0rem; font-size: 0.6rem; text-align: center; border: none; color: #666;">Print</td>
                    <td style="padding: 0rem; font-size: 0.6rem; text-align: center; border: none; color: #666;">Sign / Date</td>
                </tr>
            </table>

            <!-- Footer -->
            <div style="text-align: center; color: #666; font-size: 0.6rem; margin-top: 0.3rem;">
                <p style="margin: 0;">Created with Faithful Way Homeschool Solutions | Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
        </div>
    `;
}

function printTranscript() {
    // Create a new window for printing only the transcript
    const transcriptContent = document.getElementById('transcriptContent').innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');

    printWindow.document.write('<html><head><title>Official Transcript</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: white;
            line-height: 1.3;
        }
        .transcript-content {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.35in;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }

        /* Page settings - ONE PAGE ONLY */
        @page {
            margin: 0.3in 0.4in;
            size: letter portrait;
        }

        /* Print Styles - Force everything on one page */
        @media print {
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            html, body {
                height: 100%;
                margin: 0 !important;
                padding: 0 !important;
                overflow: hidden;
            }

            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .transcript-content {
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                break-inside: avoid !important;
                break-after: avoid !important;
            }

            /* Prevent ALL page breaks */
            * {
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
                break-inside: avoid !important;
                break-after: avoid !important;
                break-before: avoid !important;
            }

            /* Ensure tables don't break */
            table {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            thead {
                display: table-header-group;
            }

            tr {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            /* Force content to fit on one page */
            .transcript-content > div > div {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            /* Prevent orphans and widows */
            p {
                orphans: 3;
                widows: 3;
            }
        }

        /* Additional optimization for screen view */
        @media screen {
            .transcript-content {
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
        }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(transcriptContent);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

/* ============================================
   Tool 2: Schedule Builder
   ============================================ */

function initializeScheduleBuilder() {
    const form = document.getElementById('scheduleForm');
    if (!form) return;

    // Show/hide combine week option
    const applyToAllDaysCheckbox = document.getElementById('applyToAllDays');
    const combineWeekOption = document.getElementById('combineWeekOption');

    if (applyToAllDaysCheckbox && combineWeekOption) {
        applyToAllDaysCheckbox.addEventListener('change', function() {
            combineWeekOption.style.display = this.checked ? 'block' : 'none';
            if (!this.checked) {
                document.getElementById('combineWeek').checked = false;
            }
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const day = document.getElementById('scheduleDay').value;
        const childName = document.getElementById('childName').value;
        const applyToAllDays = document.getElementById('applyToAllDays').checked;
        const combineWeek = document.getElementById('combineWeek').checked;
        const includeCheckboxes = document.getElementById('includeCheckboxes').checked;
        const includeDuration = document.getElementById('includeDuration').checked;

        // Get all activities
        const times = form.querySelectorAll('input[name="activityTime[]"]');
        const activities = form.querySelectorAll('input[name="activityName[]"]');
        const durations = form.querySelectorAll('input[name="activityDuration[]"]');

        const schedule = [];
        for (let i = 0; i < times.length; i++) {
            if (times[i].value && activities[i].value) {
                schedule.push({
                    time: times[i].value,
                    activity: activities[i].value,
                    duration: durations[i].value || ''
                });
            }
        }

        // Sort by time
        schedule.sort((a, b) => a.time.localeCompare(b.time));

        // Generate schedule(s)
        let scheduleHTML = '';
        if (applyToAllDays && combineWeek) {
            // Generate combined weekly table
            scheduleHTML = generateCombinedWeeklySchedule(childName, schedule, includeCheckboxes, includeDuration);
        } else if (applyToAllDays) {
            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            weekdays.forEach((weekday, index) => {
                scheduleHTML += generateSchedule(weekday, childName, schedule, includeCheckboxes, includeDuration, index < weekdays.length - 1);
            });
        } else {
            scheduleHTML = generateSchedule(day, childName, schedule, includeCheckboxes, includeDuration, false);
        }

        // Display output
        const outputDiv = document.getElementById('scheduleOutput');
        const contentDiv = document.getElementById('scheduleContent');

        contentDiv.innerHTML = scheduleHTML;
        outputDiv.style.display = 'block';

        // Scroll to output
        outputDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

function addActivity() {
    const container = document.getElementById('activitiesContainer');

    const activityHTML = `
        <div class="activity-entry">
            <div class="form-row">
                <div class="form-group">
                    <label>Time *</label>
                    <input type="time" name="activityTime[]" required>
                </div>
                <div class="form-group">
                    <label>Activity *</label>
                    <input type="text" name="activityName[]" required placeholder="e.g., Math lesson">
                </div>
                <div class="form-group">
                    <label>Duration (min)</label>
                    <input type="number" name="activityDuration[]" placeholder="30" min="1">
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', activityHTML);
}

function generateSchedule(day, childName, schedule, includeCheckboxes, includeDuration, addPageBreak = false) {
    const childTitle = childName ? ` - ${childName}` : '';
    const pageBreakStyle = addPageBreak ? 'page-break-after: always;' : '';

    let scheduleHTML = `
        <div class="schedule-content" style="${pageBreakStyle} position: relative; margin-bottom: 3rem;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.03; pointer-events: none; z-index: 0;">
                <img src="../images/logo.png" alt="Watermark" style="width: 500px; height: auto;">
            </div>

            <div style="position: relative; z-index: 1;">
                <div style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 3px solid #ff9f2f;">
                    <h2 style="color: #4f46e5; font-size: 2rem; margin-bottom: 0.5rem;">${day} Schedule${childTitle}</h2>
                    <p style="color: #6b7280; margin: 0; font-style: italic;">Your Daily Schedule</p>
                </div>

                <div class="schedule-table">
                    <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white;">
    `;

    // Build header columns
    if (includeCheckboxes) {
        scheduleHTML += `<th style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb; width: 80px; font-size: 0.95rem;">Done</th>`;
    }
    scheduleHTML += `<th style="padding: 1rem; text-align: left; border: 1px solid #e5e7eb; width: 140px; font-size: 0.95rem;">Time</th>`;
    scheduleHTML += `<th style="padding: 1rem; text-align: left; border: 1px solid #e5e7eb; font-size: 0.95rem;">Activity</th>`;
    if (includeDuration) {
        scheduleHTML += `<th style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb; width: 120px; font-size: 0.95rem;">Duration</th>`;
    }

    scheduleHTML += `
                            </tr>
                        </thead>
                        <tbody>
    `;

    // Build schedule rows
    schedule.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        const formattedTime = formatTime(item.time);

        scheduleHTML += `<tr style="background-color: ${bgColor}; transition: background-color 0.2s;">`;

        // Checkbox column
        if (includeCheckboxes) {
            scheduleHTML += `
                <td style="padding: 1rem; border: 1px solid #e5e7eb; text-align: center;">
                    <span class="checkbox-print" style="display: inline-block; width: 24px; height: 24px; border: 2px solid #4f46e5; border-radius: 4px; line-height: 20px; font-size: 1.2rem; color: transparent;">☐</span>
                </td>
            `;
        }

        // Time column
        scheduleHTML += `
            <td style="padding: 1rem; border: 1px solid #e5e7eb; font-weight: 700; color: #4f46e5; font-size: 1rem;">
                ${formattedTime}
            </td>
        `;

        // Activity column
        scheduleHTML += `
            <td style="padding: 1rem; border: 1px solid #e5e7eb; color: #111827; font-size: 0.95rem;">
                ${item.activity}
            </td>
        `;

        // Duration column
        if (includeDuration) {
            const durationText = item.duration ? `${item.duration} min` : '-';
            scheduleHTML += `
                <td style="padding: 1rem; border: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-weight: 600;">
                    ${durationText}
                </td>
            `;
        }

        scheduleHTML += `</tr>`;
    });

    scheduleHTML += `
                        </tbody>
                    </table>
                </div>

                <div class="schedule-notes" style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #fef3e2 0%, #fff7e8 100%); border-radius: 12px; border-left: 4px solid #ff9f2f; page-break-inside: avoid;">
                    <h4 style="color: #4f46e5; font-size: 1.2rem; margin-bottom: 1rem; font-weight: 700; page-break-after: avoid;">Notes for ${day}</h4>
                    <div style="border: 2px dashed #cbd5e1; min-height: 100px; border-radius: 8px; padding: 1rem; background: white;">
                        <div style="height: 70px;"></div>
                    </div>
                </div>

                <div class="schedule-footer" style="text-align: center; color: #9ca3af; font-size: 0.9rem; margin-top: 2.5rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                    <p style="margin: 0;">Created with Faithful Way Homeschool Solutions</p>
                </div>
            </div>
        </div>
    `;

    return scheduleHTML;
}

function generateCombinedWeeklySchedule(childName, schedule, includeCheckboxes, includeDuration) {
    const childTitle = childName ? ` - ${childName}` : '';
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    let scheduleHTML = `
        <div class="schedule-content" style="position: relative; margin-bottom: 3rem;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.03; pointer-events: none; z-index: 0;">
                <img src="../images/logo.png" alt="Watermark" style="width: 500px; height: auto;">
            </div>

            <div style="position: relative; z-index: 1;">
                <div style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 3px solid #ff9f2f;">
                    <h2 style="color: #4f46e5; font-size: 2rem; margin-bottom: 0.5rem;">Weekly Schedule${childTitle}</h2>
                    <p style="color: #6b7280; margin: 0; font-style: italic;">Monday - Friday</p>
                </div>

                <div class="schedule-table">
                    <table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white;">
                                <th style="padding: 1rem; text-align: left; border: 1px solid #e5e7eb; width: 120px; font-size: 0.95rem;">Time</th>
    `;

    // Add day columns
    weekdays.forEach(day => {
        scheduleHTML += `<th style="padding: 1rem; text-align: left; border: 1px solid #e5e7eb; font-size: 0.95rem;">${day}</th>`;
    });

    if (includeDuration) {
        scheduleHTML += `<th style="padding: 1rem; text-align: center; border: 1px solid #e5e7eb; width: 100px; font-size: 0.95rem;">Duration</th>`;
    }

    scheduleHTML += `
                            </tr>
                        </thead>
                        <tbody>
    `;

    // Build rows for each time slot
    schedule.forEach((item, index) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        const formattedTime = formatTime(item.time);

        scheduleHTML += `<tr style="background-color: ${bgColor};">`;

        // Time column
        scheduleHTML += `
            <td style="padding: 1rem; border: 1px solid #e5e7eb; font-weight: 700; color: #4f46e5;">
                ${formattedTime}
            </td>
        `;

        // Activity columns for each day
        weekdays.forEach(() => {
            const checkbox = includeCheckboxes ? '<span class="checkbox-print" style="display: inline-block; width: 18px; height: 18px; border: 2px solid #4f46e5; border-radius: 3px; margin-right: 8px; vertical-align: middle;"></span>' : '';
            scheduleHTML += `
                <td style="padding: 1rem; border: 1px solid #e5e7eb; color: #111827; font-size: 0.9rem;">
                    ${checkbox}${item.activity}
                </td>
            `;
        });

        // Duration column
        if (includeDuration) {
            const durationText = item.duration ? `${item.duration} min` : '-';
            scheduleHTML += `
                <td style="padding: 1rem; border: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-weight: 600;">
                    ${durationText}
                </td>
            `;
        }

        scheduleHTML += `</tr>`;
    });

    scheduleHTML += `
                        </tbody>
                    </table>
                </div>

                <div class="schedule-notes" style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #fef3e2 0%, #fff7e8 100%); border-radius: 12px; border-left: 4px solid #ff9f2f; page-break-inside: avoid;">
                    <h4 style="color: #4f46e5; font-size: 1.2rem; margin-bottom: 1rem; font-weight: 700; page-break-after: avoid;">Weekly Notes</h4>
                    <div style="border: 2px dashed #cbd5e1; min-height: 100px; border-radius: 8px; padding: 1rem; background: white;">
                        <div style="height: 70px;"></div>
                    </div>
                </div>

                <div class="schedule-footer" style="text-align: center; color: #9ca3af; font-size: 0.9rem; margin-top: 2.5rem; padding-top: 1.5rem; border-top: 2px solid #e5e7eb;">
                    <p style="margin: 0;">Created with Faithful Way Homeschool Solutions</p>
                </div>
            </div>
        </div>
    `;

    return scheduleHTML;
}

function formatTime(time24) {
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
}

function printSchedule() {
    // Create a new window for printing only the schedule
    const scheduleContent = document.getElementById('scheduleContent').innerHTML;
    const printWindow = window.open('', '', 'height=800,width=800');

    printWindow.document.write('<html><head><title>Daily Schedule</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        @media print {
            body { padding: 0; }
            .schedule-content { page-break-after: always; page-break-inside: avoid; }
            @page { margin: 0.75in; size: letter; }
        }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(scheduleContent);
    printWindow.document.write('</body></html>');

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

/* ============================================
   Additional Tool Functions
   ============================================ */

/**
 * Helper function to clear a form
 * @param {string} formId - The ID of the form to clear
 */
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

/**
 * Helper function to download content as PDF
 * Note: This requires a PDF library like jsPDF
 * Placeholder for future implementation
 */
function downloadAsPDF(contentId, filename) {
    console.log('PDF download feature coming soon!');
    alert('PDF download feature is coming soon! For now, please use the Print button and save as PDF.');
}

// Make functions available globally for onclick handlers
window.addCourse = addCourse;
window.loadSampleData = loadSampleData;
window.addActivity = addActivity;
window.printTranscript = printTranscript;
window.printSchedule = printSchedule;
window.clearForm = clearForm;
window.downloadAsPDF = downloadAsPDF;
