export interface JobPosting {
  id: string;
  title: string;
  snippet: string;
  url: string;
  companyName?: string;
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