import jsPDF from 'jspdf';
import { AttendanceSession, StudentProfile } from '../../types';

export function generateAttendanceSheetPDF(
  session: AttendanceSession,
  allStudents: StudentProfile[],
  institutionName: string = 'DAR TECHNICAL UNIVERSITY — ASMS PORTAL',
  departmentName: string = 'College of Engineering & Technology (CoET) • Dept. of Mechanical & Industrial Engineering'
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Institutional Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(institutionName, pageWidth / 2, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(departmentName, pageWidth / 2, 22, { align: 'center' });

  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.5);
  doc.line(14, 25, pageWidth - 14, 25);

  // 2. Title Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 41, 59);
  doc.text('OFFICIAL CLASS ATTENDANCE SHEET', pageWidth / 2, 32, { align: 'center' });

  // 3. Metadata Grid
  const subjectName = session.classroom_subject?.subject?.name || 'Engineering Course';
  const subjectCode = session.classroom_subject?.subject?.code || 'ME 301';
  const lecturerName = session.classroom_subject?.lecturer
    ? `${session.classroom_subject.lecturer.title || ''} ${session.classroom_subject.lecturer.first_name} ${session.classroom_subject.lecturer.last_name}`
    : 'Course Lecturer';
  const className = session.classroom_subject?.classroom?.name || 'BSc Mechanical Engineering - Year 3';

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);

  // Left Column
  doc.text(`Subject: ${subjectCode} — ${subjectName}`, 14, 40);
  doc.text(`Class: ${className}`, 14, 46);
  doc.text(`Lecturer: ${lecturerName}`, 14, 52);

  // Right Column
  doc.text(`Date: ${session.date}`, 130, 40);
  doc.text(`Time: ${session.start_time} - ${session.end_time}`, 130, 46);
  doc.text(`Session Code: ${session.session_code}`, 130, 52);

  // Topic & Venue Banner
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 56, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Venue: ${session.venue}   |   Topic: ${session.topic}`, 16, 61.5);

  // 4. Table Header
  const startY = 68;
  const rowHeight = 7.5;

  doc.setFillColor(30, 41, 59); // dark header
  doc.rect(14, startY, pageWidth - 28, 7.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);

  doc.text('No.', 16, startY + 5);
  doc.text('Reg Number', 26, startY + 5);
  doc.text('Student Full Name', 65, startY + 5);
  doc.text('Status', 125, startY + 5);
  doc.text('Marked At', 148, startY + 5);
  doc.text('Signature / Remarks', 170, startY + 5);

  // 5. Table Rows
  let currentY = startY + 7.5;
  let presentCount = 0;
  let absentCount = 0;

  // Filter students enrolled in this classroom
  const enrolledStudents = allStudents.filter(
    (s) => !session.classroom_subject?.classroom_id || s.classroom_id === session.classroom_subject.classroom_id
  );

  enrolledStudents.forEach((student, index) => {
    const entry = session.entries?.find((e) => e.student_id === student.id);
    const isPresent = entry && (entry.status === 'PRESENT' || entry.status === 'LATE');
    if (isPresent) presentCount++;
    else absentCount++;

    const studentUser = student.user;
    const fullName = studentUser ? `${studentUser.first_name} ${studentUser.last_name}` : student.reg_number;
    const statusText = entry ? entry.status : 'ABSENT';
    const timeText = entry ? new Date(entry.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
    const signText = isPresent ? '✓ Verified (ASMS)' : '—';

    // Zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, pageWidth - 28, rowHeight, 'F');
    }

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(14, currentY + rowHeight, pageWidth - 14, currentY + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    doc.text(`${index + 1}`, 16, currentY + 5);
    doc.text(student.reg_number, 26, currentY + 5);
    doc.text(fullName, 65, currentY + 5);

    if (isPresent) {
      doc.setTextColor(22, 101, 52); // green
      doc.setFont('helvetica', 'bold');
      doc.text(statusText, 125, currentY + 5);
    } else {
      doc.setTextColor(185, 28, 28); // red
      doc.setFont('helvetica', 'normal');
      doc.text(statusText, 125, currentY + 5);
    }

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(timeText, 148, currentY + 5);
    doc.text(signText, 170, currentY + 5);

    currentY += rowHeight;
  });

  // 6. Summary Statistics & Signatures Block
  currentY += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, pageWidth - 28, 12, 'F');

  const total = enrolledStudents.length || 20;
  const rate = Math.round((presentCount / total) * 100);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Summary:  Total Enrolled: ${total}   |   Present: ${presentCount}   |   Absent: ${absentCount}   |   Attendance Rate: ${rate}%`, 18, currentY + 7.5);

  // Sign-off lines
  currentY += 20;
  doc.setDrawColor(148, 163, 184);
  doc.line(18, currentY, 80, currentY);
  doc.line(125, currentY, 185, currentY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Class Representative Signature & Date', 18, currentY + 4);
  doc.text('Course Lecturer Signature & Date', 125, currentY + 4);

  // Footer note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated automatically via ASMS Class Management Module on ${new Date().toLocaleString()}`, pageWidth / 2, 288, { align: 'center' });

  // Download trigger
  const safeCode = session.session_code.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`ASMS_Attendance_${safeCode}_${session.date}.pdf`);
}
