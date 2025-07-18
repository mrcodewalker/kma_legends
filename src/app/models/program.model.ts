export interface Semester {
  name: string;
  subjects: Subject[];
}

export interface Subject {
  name: string;
  credits: number;
  isOptional?: boolean;
}

export interface Program {
  name: string;
  code: string;
  level: string;
  degree: string;
  major: string;
  majorCode: string;
  specialization: string;
  type: string;
  programCode: string;
  approach: string;
  objectives: {
    general: string[];
    specific: {
      political: string[];
      knowledge: string[];
      professional: string[];
      social: string[];
    };
  };
  duration: string;
  credits: number;
  admissionRequirements: string;
  graduationConditions: string;
  semesters: Semester[];
}

export interface SecurityProgram extends Program {
  specializations: {
    code: string;
    name: string;
    description: string;
    objectives: string[];
  }[];
}

export interface ElectronicsProgram extends Program {
  careerOpportunities: string[];
  developmentPath: string;
  references: string[];
} 