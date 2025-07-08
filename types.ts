export interface JobPosting {
  id: string;
  title: string;
  snippet: string;
  url: string;
  companyName?: string;
  location?: string;
  matchScore?: number;
  matchedSkills?: string[];
  matchReasons?: string[];
  rawGroundingChunk?: GroundingChunk;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GeneratedEmail {
  jobTitle: string;
  emailContent: string;
}