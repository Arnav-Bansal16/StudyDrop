export type DemoCourse = {
  id: number;
  subject: string;
  catalogNumber: string;
  title: string;
  catalogYear: string;
};

export const demoCourses: DemoCourse[] = [
  { id: 1, subject: "CSC", catalogNumber: "101", title: "Fundamentals of Computer Science", catalogYear: "2026-2028" },
  { id: 2, subject: "CSC", catalogNumber: "202", title: "Data Structures", catalogYear: "2026-2028" },
  { id: 3, subject: "CSC", catalogNumber: "357", title: "Systems Programming", catalogYear: "2026-2028" },
  { id: 4, subject: "MATH", catalogNumber: "244", title: "Linear Analysis I", catalogYear: "2026-2028" },
  { id: 5, subject: "STAT", catalogNumber: "312", title: "Statistical Methods for Engineers", catalogYear: "2026-2028" },
  { id: 6, subject: "CHEM", catalogNumber: "216", title: "Organic Chemistry Laboratory", catalogYear: "2026-2028" },
  { id: 7, subject: "CPE", catalogNumber: "315", title: "Computer Architecture", catalogYear: "2026-2028" },
  { id: 8, subject: "BIO", catalogNumber: "161", title: "Introduction to Cell and Molecular Biology", catalogYear: "2026-2028" },
  { id: 9, subject: "PHYS", catalogNumber: "122", title: "College Physics II", catalogYear: "2026-2028" },
  { id: 10, subject: "ENGR", catalogNumber: "101", title: "Engineering Design I", catalogYear: "2026-2028" },
];
