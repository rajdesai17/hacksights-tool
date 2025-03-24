export interface HackathonDetails {
  name: string;
  mode: 'Online' | 'Offline';
  venue?: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  teamSize: string;
  prizePool: string;
  pptRequired: boolean;
  url: string;
}

export interface ExtractorResponse {
  success: boolean;
  data?: HackathonDetails;
  error?: string;
}